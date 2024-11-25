from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import numpy as np
import base64
from io import BytesIO
from skimage import io, transform, filters, img_as_ubyte
import torch
import torch.nn as nn
import torch.nn.functional as F
from collections import OrderedDict
from typing import Tuple
from pymongo import MongoClient
import os
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from huggingface_hub import hf_hub_download
load_dotenv()

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "https://signature-verification-chi.vercel.app"}})


def normalize_image(img: np.ndarray,
                    canvas_size: Tuple[int, int] = (1360,952)) -> np.ndarray:
     # 1) Crop the image before getting the center of mass

    # Apply a gaussian filter on the image to remove small components
    # Note: this is only used to define the limits to crop the image
    blur_radius = 2
    blurred_image = filters.gaussian(img, blur_radius, preserve_range=True)

    # Binarize the image using OTSU's algorithm. This is used to find the center
    # of mass of the image, and find the threshold to remove background noise
    threshold = filters.threshold_otsu(img)

    # Find the center of mass
    binarized_image = blurred_image > threshold
    r, c = np.where(binarized_image == 0)
    r_center = int(r.mean() - r.min())
    c_center = int(c.mean() - c.min())

    # Crop the image with a tight box
    cropped = img[r.min(): r.max(), c.min(): c.max()]
    
     # 2) Center the image
    img_rows, img_cols = cropped.shape
    max_rows, max_cols = canvas_size

    r_start = max_rows // 2 - r_center
    c_start = max_cols // 2 - c_center

    # Make sure the new image does not go off bounds
    # Emit a warning if the image needs to be cropped, since we don't want this
    # for most cases (may be ok for feature learning, so we don't raise an error)
    if img_rows > max_rows:
        # Case 1: image larger than required (height):  Crop.
        print('Warning: cropping image. The signature should be smaller than the canvas size')
        r_start = 0
        difference = img_rows - max_rows
        crop_start = difference // 2
        cropped = cropped[crop_start:crop_start + max_rows, :]
        img_rows = max_rows
    else:
        extra_r = (r_start + img_rows) - max_rows
        # Case 2: centering exactly would require a larger image. relax the centering of the image
        if extra_r > 0:
            r_start -= extra_r
        if r_start < 0:
            r_start = 0

    if img_cols > max_cols:
        # Case 3: image larger than required (width). Crop.
        print('Warning: cropping image. The signature should be smaller than the canvas size')
        c_start = 0
        difference = img_cols - max_cols
        crop_start = difference // 2
        cropped = cropped[:, crop_start:crop_start + max_cols]
        img_cols = max_cols
    else:
        # Case 4: centering exactly would require a larger image. relax the centering of the image
        extra_c = (c_start + img_cols) - max_cols
        if extra_c > 0:
            c_start -= extra_c
        if c_start < 0:
            c_start = 0

    normalized_image = np.ones((max_rows, max_cols), dtype=np.uint8) * 255
    # Add the image to the blank canvas
    normalized_image[r_start:r_start + img_rows, c_start:c_start + img_cols] = cropped

    # Remove noise - anything higher than the threshold. Note that the image is still grayscale
    normalized_image[normalized_image > threshold] = 255

    return normalized_image

def resize_image(img: np.ndarray,
                 size: Tuple[int, int]) -> np.ndarray:
    height, width = size

    # Check which dimension needs to be cropped
    # (assuming the new height-width ratio may not match the original size)
    width_ratio = float(img.shape[1]) / width
    height_ratio = float(img.shape[0]) / height
    if width_ratio > height_ratio:
        resize_height = height
        resize_width = int(round(img.shape[1] / height_ratio))
    else:
        resize_width = width
        resize_height = int(round(img.shape[0] / width_ratio))

    # Resize the image (will still be larger than new_size in one dimension)
    img = transform.resize(img, (resize_height, resize_width),
                           mode='constant', anti_aliasing=True, preserve_range=True)

    img = img.astype(np.uint8)
    # Crop to exactly the desired new_size, using the middle of the image:
    if width_ratio > height_ratio:
        start = int(round((resize_width-width)/2.0))
        return img[:, start:start + width]
    else:
        start = int(round((resize_height-height)/2.0))
        return img[start:start + height, :]
    
def crop_center(img: np.ndarray,
                size: Tuple[int, int]) -> np.ndarray:
    img_shape = img.shape
    start_y = (img_shape[0] - size[0]) // 2
    start_x = (img_shape[1] - size[1]) // 2
    cropped = img[start_y: start_y + size[0], start_x:start_x + size[1]]
    return cropped

def crop_center_multiple(imgs: np.ndarray,
                         size: Tuple[int, int]) -> np.ndarray:
    img_shape = imgs.shape[2:]
    start_y = (img_shape[0] - size[0]) // 2
    start_x = (img_shape[1] - size[1]) // 2
    cropped = imgs[:, :, start_y: start_y + size[0], start_x:start_x + size[1]]
    return cropped

# Define the model and preprocessing functions within the Flask app
def preprocess_signature(img: np.ndarray,
                         canvas_size: Tuple[int, int],
                         img_size: Tuple[int, int] =(170, 242),
                         input_size: Tuple[int, int] =(150, 220)) -> np.ndarray:
    ''' img - signature image
        canvas_size - size of the canvas img will be placed on. Should be greater than img size
        img_size - size to rescale signature
        input_size - crop the center of image
    '''
    img = img.astype(np.uint8)
    centered = normalize_image(img, canvas_size)
    inverted = 255 - centered
    resized = resize_image(inverted, img_size)

    if input_size is not None and input_size != img_size:
        cropped = crop_center(resized, input_size)
    else:
        cropped = resized

    return cropped

def decode_image(data_uri):
    """Decode a base64 string to a grayscale image."""
    _, encoded_string = data_uri.split(",", 1) # _ is the header part which is needed to trasmit base64 image data
    # #### Customize this accordingly
    # with open(path, "rb") as image_file:
    #     encoded_string = base64.b64encode(image_file.read())
    #### Customization ends
    binary_data = base64.b64decode(encoded_string)
    image = io.imread(BytesIO(binary_data), as_gray=True)
    return img_as_ubyte(image)

class SigNet(nn.Module):
    def __init__(self):
        super(SigNet, self).__init__()

        self.feature_space_size = 2048

        self.conv_layers = nn.Sequential(OrderedDict([
            ('conv1', conv_bn_mish(1, 96, 11, stride=4)),
            ('maxpool1', nn.MaxPool2d(3, 2)),
            ('conv2', conv_bn_mish(96, 256, 5, pad=2)),
            ('maxpool2', nn.MaxPool2d(3, 2)),
            ('conv3', conv_bn_mish(256, 384, 3, pad=1)),
            ('conv4', conv_bn_mish(384, 384, 3, pad=1)),
            ('conv5', conv_bn_mish(384, 256, 3, pad=1)),
            ('maxpool3', nn.MaxPool2d(3, 2)),
        ]))

        self.fc_layers = nn.Sequential(OrderedDict([
            ('fc1', linear_bn_mish(256 * 3 * 5, 2048)),
            ('fc2', linear_bn_mish(self.feature_space_size, self.feature_space_size)),
        ]))

    def forward_once(self, img):
        x = self.conv_layers(img)
        x = x.view(x.shape[0], 256 * 3 * 5)
        x = self.fc_layers(x)
        return x

    def forward(self, img1, img2):

        # Inputs need to have 4 dimensions (batch x channels x height x width), and also be between [0, 1]
        img1 = img1.view(-1, 1, 150, 220).float().div(255)
        img2 = img2.view(-1, 1, 150, 220).float().div(255)
        # forward pass of input 1
        output1 = self.forward_once(img1)
        # forward pass of input 2
        output2 = self.forward_once(img2)
        return output1, output2

def conv_bn_mish(in_channels, out_channels, kernel_size,  stride=1, pad=0):
    return nn.Sequential(OrderedDict([
        ('conv', nn.Conv2d(in_channels, out_channels, kernel_size, stride, pad, bias=False)),
        ('bn', nn.BatchNorm2d(out_channels)),
        ('mish', nn.Mish()),
    ]))


def linear_bn_mish(in_features, out_features):
    return nn.Sequential(OrderedDict([
        ('fc', nn.Linear(in_features, out_features, bias=False)),  # Bias is added after BN
        ('bn', nn.BatchNorm1d(out_features)),
        ('mish', nn.Mish()),
    ]))

class SiameseModel(nn.Module):
    def __init__(self):
        super(SiameseModel, self).__init__()

        self.model = SigNet()
        # state_dict, _, _ = torch.load("./model/signet.pth", map_location="cpu")
        # self.model.load_state_dict(state_dict)

        signet_weights_path= hf_hub_download(repo_id='meghamittal/signature-verification-model-weights', filename='signet.pth')
        state_dict, _, _ = torch.load(signet_weights_path, map_location="cpu")
        self.model.load_state_dict(state_dict)

        self.probs = nn.Linear(4, 1)
        self.projection2d = nn.Linear(self.model.feature_space_size, 2)

    def forward_once(self, img):
        x = self.model.forward_once(img)
        return x

    def forward(self, img1, img2):

        # Inputs need to have 4 dimensions (batch x channels x height x width), and also be between [0, 1]
        # forward pass of input 1
        img1 = img1.view(-1, 1, 150, 220).float().div(255)
        img2 = img2.view(-1, 1, 150, 220).float().div(255)
        embedding1 = self.forward_once(img1)
        # forward pass of input 2
        embedding2 = self.forward_once(img2)

            #print("Project embeddings into 2d space")
        embedding1 = self.projection2d(embedding1)
        embedding2 = self.projection2d(embedding2)
            # Classification
        output = torch.cat([embedding1, embedding2], dim=1)
        output= self.probs(output)

        return embedding1, embedding2, output
    

file_path = hf_hub_download(repo_id="meghamittal/signature-verification-model-weights", filename="best_model_21.pt")

model= SiameseModel()

checkpoint = torch.load(file_path, map_location='cpu')
model.load_state_dict(checkpoint['model'])
model.eval()
model.to('cpu')

# # Load your trained model
# model = SiameseModel()
# # model.load_state_dict(torch.load("signet.pth", map_location='cpu'))  # Adjust the path as necessary
# model.load_state_dict((torch.load('./model/best_model_21.pt', weights_only=False , map_location='cpu'))['model'])
# # print(torch.load('best_model_21.pt', weights_only=False)) # For testing
# model.eval()
# model.to('cpu')

# Connect to MongoDB
client = MongoClient(os.getenv('MONGODB_URI'))
print('Connection has been established with MongoDB succesfully!')
db = client["signature_verification"]  # Database name
users_collection = db["users"]  # Collection name

# @app.route('/', methods=['GET'])
# def test():
#     print("testing!!")
#     return "Testing!!", 200  # Return a response to the client

@app.route('/create_user', methods=['POST'])
def create_user():
    # Parse JSON data from client
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    genuine_signature = data.get('genuineSignature')

    # Insert data into MongoDB
    user_data = {
        "name": name,
        "email": email,
        "signature_image": genuine_signature
    }
    result = users_collection.insert_one(user_data)

    return jsonify({
        "status": "success",
        "message": "User created successfully!",
        "user_id": str(result.inserted_id)  # Return the MongoDB-generated ID
    })

@app.route('/get_users', methods=['GET'])
def get_users():
    # Retrieve all users from MongoDB
    users = list(users_collection.find({}, {"_id": 0}))  # Exclude MongoDB `_id` from response
    return jsonify(users)

@app.route('/verify_signature', methods=['POST'])
def verify_signature():
    data = request.get_json()
    if not data or 'image1' not in data or 'image2' not in data:
        return jsonify({'error': 'Missing image data'}), 400

    try:
        img1_array = decode_image(data['image1'])
        img2_array = decode_image(data['image2'])
        img1_processed = preprocess_signature(img1_array, (952, 1360), (256, 256))
        img2_processed = preprocess_signature(img2_array, (952, 1360), (256, 256))

        img1_tensor = torch.tensor(img1_processed)
        img2_tensor = torch.tensor(img2_processed)

        with torch.no_grad():
            output1, output2, confidence = model(img1_tensor, img2_tensor)
            confidence = torch.sigmoid(confidence).item()  # Convert output to probability
            cos_sim = F.cosine_similarity(F.normalize(output1), F.normalize(output2)).item()
            # Ensure similarity is non-negative
            if cos_sim < 0:
                cos_sim *= -1

        # Define a threshold for classification
        threshold = 0.9  # Adjust based on model behavior and validation
        classification = 'Genuine' if cos_sim > threshold else 'Forged'
        return jsonify({'similarity': f"{cos_sim * 100:.2f}%", 'classification': classification, 'confidence': confidence})

    except Exception as e:
        return jsonify({'error': 'Failed to process images', 'message': str(e)}), 500

app.config['SECRET_KEY'] = 'SECRET'  # Replace with a strong secret key

# MongoDB setup
# client = MongoClient("mongodb://localhost:27017/")  # Adjust MongoDB URI if needed
# db = client['signature_verification']  # Replace with your database name
collection = db['admin']  # Replace with your collection name
# collection_admin = db['admin']
# CORS configuration

# JWT middleware for protected routes (if needed in future)
def authenticate_token(f):
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"message": "Access Denied"}), 401
        try:
            decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            request.user = decoded
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token Expired"}), 403
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid Token"}), 403
        return f(*args, **kwargs)
    return wrapper

# Login Route
@app.route("/", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    try:
        user = collection.find_one({"email": email})
        if not user:
            return jsonify({"message": "User does not exist"}), 404

        if not check_password_hash(user['password'], password):
            return jsonify({"message": "Wrong password"}), 400

        # Generate JWT Token
        token = jwt.encode(
            {"email": user['email'], "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
            app.config['SECRET_KEY'],
            algorithm="HS256"
        )
        return jsonify({"token": token}), 200

    except Exception as e:
        print(e)
        return jsonify({"message": "Server Error"}), 500

# Signup Route
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    try:
        user_exists = collection.find_one({"email": email})
        if user_exists:
            return jsonify({"message": "User already exists"}), 400

        # Hash the password
        hashed_password = generate_password_hash(password)

        # Save new user
        new_user = {"email": email, "password": hashed_password}
        collection.insert_one(new_user)

        return jsonify({"message": "User created successfully"}), 201

    except Exception as e:
        print(e)
        return jsonify({"message": "Server Error"}), 500


app.run(port='8000', host='0.0.0.0', debug=False)
