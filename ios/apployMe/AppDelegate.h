#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
#import <UMCore/UMAppDelegateWrapper.h>
#import <UserNotifications/UNUserNotificationCenter.h>

 
// @interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate>

@interface AppDelegate : UMAppDelegateWrapper <UIApplicationDelegate, RCTBridgeDelegate, UNUserNotificationCenterDelegate>

 

@property (nonatomic, strong) UIWindow *window;

@end
