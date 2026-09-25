// swift-tools-version: 5.9
import PackageDescription
let package = Package(
  name: "LuaD1Wifi",
  platforms: [.iOS(.v15)],
  products: [.library(name: "LuaD1Wifi", targets: ["LuaD1WifiPlugin"])],
  dependencies: [.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")],
  targets: [.target(name: "LuaD1WifiPlugin", dependencies: [
    .product(name: "Capacitor", package: "capacitor-swift-pm")
  ], path: "ios/Sources/LuaD1WifiPlugin")]
)
