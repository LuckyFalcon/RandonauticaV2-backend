# RandonauticaV2-backend
Backend for Randonautica V2


IAPurchases: Responsible for the verifying the in app purchases users make

AppleSignIn: Responsible for signing in with Apple accounts on Android

getAttractors: Get attractors

logTrip: Logs trip with title, description and image

syncReports: Syncs old generated points the user has saved

Users: Contains agreement, shareWithFriends, signInStreak and SignInUser

- Agreement, accepts agreement. (Currently unused)
- ShareWithFriends, (Currently unused)
- SignInStreak, upgrades the sign in streak for the user (Currently unused)
- SignInUser, signs user in

TripReports: Contain removeTrip, saveTrip & visitTrip
- Remove trip, sets is_saved for a trip to 0
- Save Trip, sets is_saved for a trip to 1
- Visit Trip, sets is_visited for a trip to 1
