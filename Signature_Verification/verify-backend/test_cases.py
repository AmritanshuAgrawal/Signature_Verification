import unittest
import numpy as np
from io import BytesIO
import base64
from app2 import (
    normalize_image, 
    resize_image,
    crop_center,
    crop_center_multiple,
    preprocess_signature,
    decode_image
)

class TestImagePreprocessing(unittest.TestCase):
    
    def test_normalize_image(self):
        # Create a sample image
        img = np.random.randint(0, 256, size=(100, 200), dtype=np.uint8)
        
        # Test that the output image has the expected size
        output = normalize_image(img, (1360, 952))
        self.assertEqual(output.shape, (1360, 952))
        
        # Test that the output image is properly centered
        r, c = np.where(output < 255)
        self.assertAlmostEqual(r.mean() - r.min(), 680, delta=20)
        self.assertAlmostEqual(c.mean() - c.min(), 476, delta=20)
        
    def test_resize_image(self):
        # Create a sample image
        img = np.random.randint(0, 256, size=(100, 200), dtype=np.uint8)
        
        # Test that the output image has the expected size
        output = resize_image(img, (150, 220))
        self.assertEqual(output.shape, (150, 220))
        
    def test_crop_center(self):
        # Create a sample image
        img = np.random.randint(0, 256, size=(100, 200), dtype=np.uint8)
        
        # Test that the output image has the expected size
        output = crop_center(img, (80, 120))
        self.assertEqual(output.shape, (80, 120))
        
    def test_crop_center_multiple(self):
        # Create a sample batch of images
        imgs = np.random.randint(0, 256, size=(10, 1, 100, 200), dtype=np.uint8)
        
        # Test that the output batch has the expected size
        output = crop_center_multiple(imgs, (80, 120))
        self.assertEqual(output.shape, (10, 1, 80, 120))
        
    def test_preprocess_signature(self):
        # Create a sample image
        img = np.random.randint(0, 256, size=(100, 200), dtype=np.uint8)
        
        # Test that the output image has the expected size
        output = preprocess_signature(img, (952, 1360))
        self.assertEqual(output.shape, (150, 220))
        
    def test_decode_image(self):
        # Create a sample base64 string
        img = np.random.randint(0, 256, size=(100, 200), dtype=np.uint8)
        _, encoded_string = base64.b64encode(img.tobytes()).decode('ascii').split(",", 1)
        
        # Test that the output image has the expected size
        output = decode_image(f"data:image/png;base64,{encoded_string}")
        self.assertEqual(output.shape, (100, 200))

if __name__ == '__main__':
    unittest.main()