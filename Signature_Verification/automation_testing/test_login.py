from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Initialize the WebDriver
driver = webdriver.Chrome()  # Replace with the path to your ChromeDriver if necessary
driver.maximize_window()

# URL of the Login page
url = "http://localhost:3000"

try:
    # Navigate to the Login page
    driver.get(url)
    time.sleep(3)  # Pause to observe page load

    # Wait for the page to load and input fields to be present
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Email address']"))
    )

    # Define test data
    valid_email = "mittalmegha@gmail.com"
    valid_password = "password"
    invalid_email = "wronguser@example.com"
    invalid_password = "wrongpassword"

    # Test Case 1: Successful Login
    print("Running Test Case 1: Successful Login")
    driver.find_element(By.XPATH, "//input[@placeholder='Email address']").clear()
    time.sleep(1)  # Pause to observe clearing the field
    driver.find_element(By.XPATH, "//input[@placeholder='Email address']").send_keys(valid_email)
    time.sleep(1)  # Pause to observe typing
    driver.find_element(By.XPATH, "//input[@placeholder='Password']").clear()
    time.sleep(1)
    driver.find_element(By.XPATH, "//input[@placeholder='Password']").send_keys(valid_password)
    time.sleep(1)
    driver.find_element(By.XPATH, "//button[text()='Login →']").click()

    # Wait for navigation or success message
    time.sleep(5)  # Observe the navigation or result
    if driver.current_url.endswith("/form"):
        print("Test Case 1 Passed: Successfully navigated to the form page")
    else:
        print("Test Case 1 Failed: Did not navigate to the form page")

    # Navigate back to Login page for the next test
    driver.get(url)
    time.sleep(2)  # Pause to observe returning to login page

    # Test Case 2: Invalid Credentials
    print("Running Test Case 2: Invalid Credentials")
    driver.find_element(By.XPATH, "//input[@placeholder='Email address']").clear()
    time.sleep(1)
    driver.find_element(By.XPATH, "//input[@placeholder='Email address']").send_keys(invalid_email)
    time.sleep(1)
    driver.find_element(By.XPATH, "//input[@placeholder='Password']").clear()
    time.sleep(1)
    driver.find_element(By.XPATH, "//input[@placeholder='Password']").send_keys(invalid_password)
    time.sleep(1)
    driver.find_element(By.XPATH, "//button[text()='Login →']").click()

    # Wait for error message to appear
    time.sleep(5)  # Observe the error message
    error_message = driver.find_element(By.XPATH, "//div[contains(@style, 'color: red')]").text
    if error_message:
        print(f"Test Case 2 Passed: Error message displayed - '{error_message}'")
    else:
        print("Test Case 2 Failed: No error message displayed for invalid credentials")


except Exception as e:
    print(f"An error occurred: {e}")

finally:
    # Close the browser
    time.sleep(3)  # Pause before closing to observe final state
    driver.quit()
