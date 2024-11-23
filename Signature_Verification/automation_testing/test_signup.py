import time  # To add fixed delays
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoAlertPresentException

driver = webdriver.Chrome()  # Ensure chromedriver is in your PATH
driver.maximize_window()
url = "http://localhost:3000/signup"

try:
    # Open the signup page
    driver.get(url)

    # Adding a fixed delay to simulate human-like interaction
    time.sleep(2)

    # Wait for the email input field to be present using the placeholder
    email_input = WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Email address']"))
    )
    time.sleep(1)  # Slight pause before filling in the email

    password_input = driver.find_element(By.XPATH, "//input[@placeholder='Set password']")

    # Fill in the signup form
    email_input.send_keys("mittalmegha@gmail.com")
    time.sleep(1)  # Pause before entering the password
    password_input.send_keys("password")
    time.sleep(1)  # Pause before submitting

    # Submit the form using the button's type attribute
    submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
    submit_button.click()
    time.sleep(2)  # Pause to wait for the alert or success message

    # Handle the alert box
    try:
        WebDriverWait(driver, 10).until(EC.alert_is_present())  # Wait for the alert
        alert = driver.switch_to.alert  # Switch to the alert
        alert_text = alert.text  # Get the alert text
        print(f"Alert Text: {alert_text}")
        alert.accept()  # Accept (close) the alert
    except NoAlertPresentException:
        print("No alert appeared after form submission.")

    # Continue to verify success if needed
    print("Signup test passed!")

except TimeoutException as e:
    print(f"Timeout occurred: {e}")
except Exception as e:
    print(f"Signup test failed: {e}")

finally:
    # Close the browser
    driver.quit()
