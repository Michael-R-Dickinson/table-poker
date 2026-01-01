## No-Chip Poker

### Overview

An app for playing in-person poker without physical chips. 
It works like this:
- A host device sits in the center of the table, displaying the pot and community cards
- Players connect and play actions on their own devices
- All poker logic and game state is handled automatically

### Implementation

The app connects all devices **peer-to-peer** via **WebRTC**, such that the host device is the central store for game-state and broadcasts relevant info all other devices. 

#### WebRTC Setup
To initialize the WebRTC connections, the app uses an AWS Lambda function with API Gateway's Websockets API for its signaling server. 

1. Devices connect to the WebSocket with a game code
2. Websocket forwards SDP and ICE messages between players and host devices who are in the same game room
3. Once the WebRTC connection is established, devices disconnect from the WebSocket and interact in game peer-to-peer


To view the infrastructure configuration, see `/infrastructure/signaling-sever` for Terraform IaC. 

#### Poker Game

Poker game state is handled via the `poker-ts` library with a global game object on each host device. 


## Screenshots

<table align="center">
  <!-- Row for Portrait Images -->
  <tr>
    <td><img src="https://github.com/user-attachments/assets/1970923e-152e-48b8-b475-726a38039d6e" alt="Player Screen" width="300"/></td>
    <td><img src="https://github.com/user-attachments/assets/1a48bfed-a414-45d7-8be7-e0adc194d383" alt="Host Screen" width="300"/></td>
  </tr>
  <!-- Row for Landscape Image -->
  <tr>
    <td colspan="2" align="center"><img src="https://github.com/user-attachments/assets/3dc32e39-306a-44f1-8497-3b95630a41c8" alt="Host-in-Game Screen" width="615"/></td>
  </tr>
</table>

**Note: Host screen has is symmetric vertically so that it can sit in the center of the table and be readable by all players**


### Tech Stack

- **Frontend:** React Native, Expo, Expo Router
- **State Management:** Jotai
- **WebRTC:** `react-native-webrtc`
- **Poker Logic:** `poker-ts`
- **Backend (Signaling):** AWS Lambda (Python), API Gateway (WebSockets), DynamoDB
- **Infrastructure as Code:** Terraform

### Project Structure

- `table-poker/`: The main React Native (Expo) mobile application.
- `infrastructure/signaling-server/`: Terraform IaC for the AWS signaling server (Lambda, API Gateway, DynamoDB).
- `lambda/`: Source code for the Python signaling Lambda function.
- `docs/`: Architectural diagrams and documentation.

### Getting Started

#### 1. Set Up the Signaling Server

The backend infrastructure is managed with Terraform.

1.  Navigate to the infrastructure directory:
    ```bash
    cd infrastructure/signaling-server
    ```
2.  Initialize Terraform:
    ```bash
    terraform init
    ```
3.  Deploy the resources to your AWS account:
    ```bash
    terraform apply
    ```
4.  After applying, Terraform will output a `websocket_url`. Copy this URL.

#### 2. Run the Mobile App

1.  Navigate to the app directory:
    ```bash
    cd table-poker
    ```
2.  Install dependencies (this project uses pnpm):
    ```bash
    pnpm install
    ```
3.  Create a local environment file:
    ```bash
    cp .env.example .env
    ```
4.  Open `.env` and paste the `websocket_url` you copied from the Terraform output:
    ```
    EXPO_PUBLIC_WEBSOCKET_URL="wss://your-websocket-url.execute-api.us-east-1.amazonaws.com/production"
    ```
5.  Start the Expo development server:
    ```bash
    pnpm start
    ```
6.  Follow the instructions in the terminal to run the app on a simulator or physical device.

### Deployment

- **Application:** The mobile app is configured for deployment using [Expo Application Services (EAS)](https://expo.dev/eas). See the `eas.json` file for build and submission configurations.
- **Infrastructure:** The signaling server infrastructure is deployed via Terraform. Any changes to the backend in the `infrastructure/` directory can be applied by running `terraform apply`.
