# CI/CD Setup for App Store Submission

This document explains how to set up automatic builds and App Store submissions using GitHub Actions and EAS.

## Prerequisites

1. **Expo Account**: You need an Expo account with EAS configured
2. **Apple Developer Account**: Required for App Store submissions
3. **GitHub Repository**: Your code should be in a GitHub repository

## Setup Steps

### 1. Configure Local Environment (.env file)

Update your `.env` file with your Apple credentials:

```bash
# Apple App Store Configuration
APPLE_ID=your-apple-id@example.com
ASC_APP_ID=1234567890
APPLE_TEAM_ID=ABCDE12345
```

**To find these values:**

- **APPLE_ID**: Your Apple ID email address
- **ASC_APP_ID**: Go to App Store Connect → Your App → App Information → General Information → Apple ID (10-digit number)
- **APPLE_TEAM_ID**: Go to https://developer.apple.com/account → Membership → Team ID

**Note**: The `.env` file is already in `.gitignore` and will NOT be committed to GitHub.

### 2. Generate an Expo Access Token

1. Go to https://expo.dev/accounts/[your-account]/settings/access-tokens
2. Create a new access token with a descriptive name (e.g., "GitHub Actions")
3. Copy the token (you won't be able to see it again)

### 3. Generate an Apple App-Specific Password

1. Go to https://appleid.apple.com/account/manage
2. Sign in with your Apple ID
3. In the "Sign-In and Security" section, select "App-Specific Passwords"
4. Click "Generate an app-specific password"
5. Enter a name (e.g., "EAS Submit") and click "Create"
6. Copy the generated password

### 4. Configure GitHub Secrets

Go to your GitHub repository settings → Secrets and variables → Actions, and add the following secrets:

- **EXPO_TOKEN**: Your Expo access token from step 2
- **EXPO_APPLE_APP_SPECIFIC_PASSWORD**: Your Apple app-specific password from step 3
- **APPLE_ID**: Your Apple ID email (same as in .env)
- **ASC_APP_ID**: Your App Store Connect app ID (same as in .env)
- **APPLE_TEAM_ID**: Your Apple Team ID (same as in .env)

### 5. Configure EAS Build Credentials

Run this command to set up your iOS credentials with EAS:

```bash
eas credentials
```

Follow the prompts to configure your distribution certificate and provisioning profile.

## How It Works

The GitHub Actions workflow (`.github/workflows/build-and-submit.yml`) will automatically:

1. **Trigger** on:
   - Direct pushes to the `master` branch
   - When a PR is merged into `master` (e.g., from `dev` branch)

2. **Build** your iOS app using EAS Build with the `production` profile

3. **Submit** the built app to App Store Connect for review

The Apple credentials are securely stored:
- **Locally**: In your `.env` file (not committed to Git)
- **CI/CD**: As GitHub Secrets (encrypted and secure)
- **EAS Config**: References environment variables using `$VARIABLE_NAME` syntax

## Local Testing

To test EAS submit locally with your .env file:

```bash
# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Test submit (after you have a build)
eas submit --platform ios --profile production --latest
```

## Manual Trigger (Optional)

If you want to manually trigger builds, you can add this to the workflow:

```yaml
on:
  workflow_dispatch:
```

Then you can manually run the workflow from the Actions tab in GitHub.

## Monitoring

- View workflow runs in your GitHub repository under the "Actions" tab
- Check EAS build status at https://expo.dev/accounts/[your-account]/projects/hn-reader/builds
- View App Store submissions in App Store Connect

## Troubleshooting

### Build Fails

- Check that your `EXPO_TOKEN` secret is valid
- Ensure your EAS credentials are properly configured (`eas credentials`)
- Review the build logs in the GitHub Actions tab
- Verify that GitHub Secrets are properly set (APPLE_ID, ASC_APP_ID, APPLE_TEAM_ID)

### Submission Fails

- Verify your `EXPO_APPLE_APP_SPECIFIC_PASSWORD` secret is correct
- Ensure your Apple credentials in GitHub Secrets match your Apple Developer account
- Make sure your app version complies with App Store requirements
- Check that you have a valid distribution certificate and provisioning profile

### Environment Variables Not Loading

- Ensure your `.env` file has the correct values locally
- Verify all GitHub Secrets are set correctly (no typos)
- Check that `eas.json` references variables with `$VARIABLE_NAME` syntax

### App Rejected by App Store

- Review the rejection details in App Store Connect
- Fix the issues in your code
- Push changes to `master` to trigger a new build and submission

## Optional: Android Submission

To also submit to Google Play Store, add these secrets:

- **EXPO_ANDROID_KEYSTORE_PASSWORD**: Your Android keystore password
- **EXPO_ANDROID_KEY_PASSWORD**: Your Android key password

And update the workflow to build and submit Android:

```yaml
- name: Build Android app
  run: eas build --platform android --profile production --non-interactive --no-wait

- name: Submit to Google Play
  run: eas submit --platform android --profile production --latest --non-interactive
```

## Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use GitHub Secrets** for CI/CD - All sensitive data is encrypted
3. **Rotate credentials regularly** - Update app-specific passwords periodically
4. **Use app-specific passwords** - Never use your main Apple ID password
5. **Limit access** - Only give necessary team members access to secrets

## Cost Considerations

- EAS Build has usage limits on the free tier
- Consider using the `m-medium` resource class (already configured) for faster builds
- Monitor your usage at https://expo.dev/accounts/[your-account]/settings/billing

## Support

- EAS Documentation: https://docs.expo.dev/eas/
- Expo Forums: https://forums.expo.dev/
- GitHub Actions Documentation: https://docs.github.com/en/actions
