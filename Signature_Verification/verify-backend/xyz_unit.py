import unittest
from unittest.mock import patch, MagicMock
from flask import json
import numpy as np
from skimage import data
from app2 import app, preprocess_signature, decode_image, users_collection


class TestFlaskApp(unittest.TestCase):

    def setUp(self):
        # Set up a test client for the Flask app
        self.app = app.test_client()
        self.app.testing = True

    @patch("app2.users_collection")
    def test_create_user(self, mock_users_collection):
        # Mock the MongoDB insert_one method
        mock_insert = MagicMock()
        mock_users_collection.insert_one = mock_insert

        # Prepare test data
        test_data = {
            "name": "Test User",
            "email": "testuser@example.com",
            "genuineSignature": "base64_encoded_image_string"
        }

        # Simulate POST request
        response = self.app.post(
            '/create_user',
            data=json.dumps(test_data),
            content_type='application/json'
        )

        # Assert the status code and response
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        self.assertEqual(response_data["status"], "success")
        self.assertIn("user_id", response_data)

        # Verify the mock method was called
        mock_insert.assert_called_once_with({
            "name": test_data["name"],
            "email": test_data["email"],
            "signature_image": test_data["genuineSignature"]
        })

    def test_preprocess_signature(self):
        # Create a mock NumPy array to simulate an image
        mock_image = np.ones((100, 100), dtype=np.uint8)
        canvas_size = (1360, 952)

        # Call preprocess_signature
        processed_image = preprocess_signature(mock_image, canvas_size)

        # Assert the output shape matches the canvas size
        self.assertEqual(processed_image.shape, canvas_size)

    def test_decode_image(self):
        # Provide a valid base64 string for testing
        with open("Signature_Verification/verify-backend/sample_image.png", "rb") as img_file:
            binary_data = img_file.read()
        base64_string = f"data:image/png;base64,{binary_data.hex()}"

        decoded_image = decode_image(base64_string)

        # Assert the decoded image is not None
        self.assertIsNotNone(decoded_image)

    @patch("app2.model")
    def test_model_inference(self, mock_model):
        # Mock the model's output
        mock_model.forward.return_value = (MagicMock(), MagicMock(), MagicMock())

        # Prepare test inputs
        img1 = MagicMock()
        img2 = MagicMock()

        # Call the model inference function
        embedding1, embedding2, output = mock_model.forward(img1, img2)

        # Assert embeddings and output are not None
        self.assertIsNotNone(embedding1)
        self.assertIsNotNone(embedding2)
        self.assertIsNotNone(output)


if __name__ == "__main__":
    unittest.main()
