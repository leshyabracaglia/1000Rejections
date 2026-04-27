import XCTest

class ScreenshotTests: XCTestCase {
    var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
    }

    override func tearDownWithError() throws {
        app.terminate()
    }

    func testTakeScreenshots() throws {
        let creds = try loadCreds()
        let device = ProcessInfo.processInfo.environment["SIMULATOR_DEVICE_NAME"] ?? "Device"
        let dir = creds.outputDir

        addUIInterruptionMonitor(withDescription: "System Alert") { alert in
            alert.buttons.firstMatch.tap()
            return true
        }

        app.launch()

        // 01 — Login screen
        XCTAssertTrue(app.textFields["Email"].waitForExistence(timeout: 15))
        try save(name: "\(device)-01-Login", to: dir)

        // Log in
        app.textFields["Email"].tap()
        app.textFields["Email"].typeText(creds.email)
        app.secureTextFields["Password"].tap()
        app.secureTextFields["Password"].typeText(creds.password)
        app.buttons["auth-submit-button"].tap()

        // 02 — Empty home state
        let signOut = app.buttons["sign-out-button"]
        XCTAssertTrue(signOut.waitForExistence(timeout: 30))
        Thread.sleep(forTimeInterval: 3)
        try save(name: "\(device)-02-Home", to: dir)

        // Open add screen
        let addButton = app.buttons["add-rejection-button"]
        XCTAssertTrue(addButton.waitForExistence(timeout: 5))
        addButton.tap()

        // Type a title so the form looks realistic
        let titleField = app.textFields["What did you apply for?"]
        XCTAssertTrue(titleField.waitForExistence(timeout: 5))
        titleField.tap()
        titleField.typeText("YC S26 Application")

        // 03 — Add rejection form
        Thread.sleep(forTimeInterval: 1)
        try save(name: "\(device)-03-Add", to: dir)

        // Submit the form
        let addEventBtn = app.buttons.matching(NSPredicate(format: "label == %@", "Add Event")).firstMatch
        XCTAssertTrue(addEventBtn.waitForExistence(timeout: 5))
        addEventBtn.tap()

        // Wait for the rejection card to appear — covers API save + nav back + home refetch
        let rejectionCard = app.buttons.matching(NSPredicate(format: "label == %@", "YC S26 Application")).firstMatch
        XCTAssertTrue(rejectionCard.waitForExistence(timeout: 30))
        rejectionCard.tap()

        // 04 — Edit / detail screen
        let editNavBar = app.navigationBars["Edit Rejection"]
        XCTAssertTrue(editNavBar.waitForExistence(timeout: 10))
        Thread.sleep(forTimeInterval: 2)
        try save(name: "\(device)-04-Edit", to: dir)

        // Change status to Rejected while on the edit screen
        let statusRejectedBtn = app.buttons["status-rejected"]
        XCTAssertTrue(statusRejectedBtn.waitForExistence(timeout: 5))
        statusRejectedBtn.tap()

        // Save the changes
        let saveChangesBtn = app.buttons.matching(NSPredicate(format: "label == %@", "Save Changes")).firstMatch
        XCTAssertTrue(saveChangesBtn.waitForExistence(timeout: 5))
        saveChangesBtn.tap()

        // Wait for home
        XCTAssertTrue(signOut.waitForExistence(timeout: 15))
        Thread.sleep(forTimeInterval: 3)

        // Add a second rejection
        addButton.tap()
        let titleField2 = app.textFields["What did you apply for?"]
        XCTAssertTrue(titleField2.waitForExistence(timeout: 5))
        titleField2.tap()
        titleField2.typeText("Google SWE Interview")
        let addEventBtn2 = app.buttons.matching(NSPredicate(format: "label == %@", "Add Event")).firstMatch
        XCTAssertTrue(addEventBtn2.waitForExistence(timeout: 5))
        addEventBtn2.tap()

        // Wait for home with 2 rejections (YC S26 = Rejected, Google SWE = Pending)
        XCTAssertTrue(signOut.waitForExistence(timeout: 15))
        Thread.sleep(forTimeInterval: 3)

        // 05 — Home list with mixed statuses
        try save(name: "\(device)-05-Home-List", to: dir)
    }

    private struct Creds: Decodable {
        let email: String
        let password: String
        let outputDir: String
        enum CodingKeys: String, CodingKey {
            case email, password
            case outputDir = "output_dir"
        }
    }

    private func loadCreds() throws -> Creds {
        let data = try Data(contentsOf: URL(fileURLWithPath: "/tmp/screenshot_creds.json"))
        return try JSONDecoder().decode(Creds.self, from: data)
    }

    private func save(name: String, to dir: String) throws {
        try FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true)
        let png = XCUIScreen.main.screenshot().pngRepresentation
        try png.write(to: URL(fileURLWithPath: "\(dir)/\(name).png"))
    }
}
