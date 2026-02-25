# python -m pip install selenium
# python -m pip install chromedriver-autoinstaller
# https://sites.google.com/chromium.org/driver/

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.action_chains import ActionChains
import time

options = Options()
options.add_argument("--disable-blink-features=AutomationControlled")
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option('useAutomationExtension', False)
options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
options.add_argument("--disable-extensions")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")

service = Service(executable_path="chromedriver.exe")
driver = webdriver.Chrome(service=service, options=options)

driver.get("http://localhost:8080/login")

WebDriverWait(driver, 5).until(
    EC.presence_of_element_located((By.ID, "email"))
)

email_id = driver.find_element(By.ID, "email")
email_id.send_keys("admin@servicelink.com")

password = driver.find_element(By.ID, "password")
password.send_keys("admin123")

login_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Sign In')]")
login_button.click()

# next_field = driver.switch_to.active_element
# next_field.send_keys("80000000" + Keys.TAB)

# next_field = driver.switch_to.active_element
# next_field.send_keys("100000000" + Keys.TAB)

# time.sleep(0.5)
# next_field = driver.switch_to.active_element
# next_field.click()

# WebDriverWait(driver, 5).until(
#     EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Download Business Health Report')]"))
# )
# time.sleep(0.5)

# downloadButton = driver.find_element(By.XPATH, "//button[contains(text(), 'Download Business Health Report')]")

# driver.execute_script(
#     "arguments[0].scrollIntoView({block: 'center', inline: 'nearest'});", 
#     downloadButton
# )
# time.sleep(4.0)
# downloadButton.click()

time.sleep(60*15)
driver.quit()