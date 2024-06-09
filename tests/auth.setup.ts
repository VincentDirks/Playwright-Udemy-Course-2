import { test as setup } from "@playwright/test"

const authfile = ".auth/user.json"

setup("authentication", async ({ page }) => {
  await page.goto("https://conduit.bondaracademy.com/")
  await page.getByText("Sign in").click()
  await page
    .getByRole("textbox", { name: "Email" })
    .fill("conduit@dirksonline.net")
  await page
    .getByRole("textbox", { name: "Password" })
    .fill("qB85R86#ZMKME$jVEVq#vJMDr*A!cJk")
  await page.getByRole("button").click()

  await page.waitForResponse('https://conduit-api.bondaracademy.com/api/tags')
                              
  await page.context().storageState({ path: authfile })
})
