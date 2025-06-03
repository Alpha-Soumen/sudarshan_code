
# 🎓 EduEvent Hub – Comprehensive Event Management System for Educational Institutes

### 📌 Live Demo: [EduEvent Hub on Vercel](https://event-management-system-7fal84ugy-sudarshs-projects.vercel.app/)
🖼️ Website Preview  
![EduEvent Hub Screenshot](https://github.com/user-attachments/assets/938ffab6-2b74-4660-87f2-be284ede79d1)

📄 PDF Version: [Download Website Preview (PDF)](https://github.com/user-attachments/files/20576337/screencapture-6000-idx-studio-1746077234203-cluster-fkltigo73ncaixtmokrzxhwsfc-cloudworkstations-dev-2025-05-01-15_15_28.pdf)

---

## 📖 Project Overview

EduEvent Hub is a real-time, robust event management system built for educational institutes. This platform simplifies the process of creating, discovering, and managing educational events, providing a seamless experience for both students/participants and college authorities/event managers.

### 🔥 Why EduEvent Hub?

* Built in a 7-hour hackathon with a 5-hour MVP focus.
* Centralizes event management for educational institutions.
* Supports both in-person and virtual events.
* Scalable with Firebase as the backend and Vercel for hosting.

---

## 🚀 Key Features

### ✅ Minimum Viable Product (MVP)

1. **Event Listing/Discovery:**

   * Displays all available events in a simple, user-friendly list.
   * Initial version supports basic event display without filtering.

2. **Event Detail View:**

   * Provides a detailed view of each event with essential information:

     * Event Title
     * Description
     * Date & Time
     * Location (Physical or Virtual)

3. **Basic Event Creation (Admin Only):**

   * Simple form for creating new events.
   * Only accessible to designated admins.
   * Fields: Event Title, Description, Date, Time, Location/Link.

4. **Firebase Backend Integration:**

   * Real-time database management using Firebase Cloud Firestore.
   * Persistent data storage for events and user interactions.

5. **Responsive UI:**

   * Adaptive design for desktop, tablet, and mobile devices.
   * Clean and intuitive user interface.

### 🚀 Advanced Features (Post-MVP)

1. **User Authentication & Profiles:**

   * Secure login system for users using Firebase Authentication.
   * User profiles for tracking registered events and favorites.

2. **Event Filtering & Search:**

   * Advanced search and filter options (Date, Category, Location).
   * Makes event discovery faster and more efficient.

3. **Event Registration/RSVP:**

   * Allows users to register for events.
   * Registration data stored in Firebase for tracking.

4. **Notifications & Reminders:**

   * Email or in-app notifications for upcoming events.
   * Customizable reminders for registered events.

5. **Rich Media Support:**

   * Image and video uploads for events.
   * Visual enhancements for event listings.

6. **Calendar Integration:**

   * "Add to Calendar" buttons for Google Calendar, iCal, etc.

7. **User Event Submission (With Admin Approval):**

   * Community-driven event submissions.
   * Admin review and approval workflow.

8. **Interactive Map for In-Person Events:**

   * Integrated Google Maps for location visualization.

9. **Enhanced UI/UX:**

   * Visual design improvements.
   * Optimized for accessibility (keyboard navigation, screen reader support).

10. **Dark Mode Support:**

    * User option to switch between light and dark themes.

---

## 🛠️ Built With

* **Frontend:** HTML, CSS, JavaScript (React.js or Next.js)
* **Backend:** Firebase (Cloud Firestore, Authentication)
* **Hosting:** Vercel (Fast, scalable deployment)
* **Version Control:** Git & GitHub
* **Package Manager:** npm, yarn, or pnpm
* **Code Editor:** Visual Studio Code (VS Code)
* **Other Tools:** Firebase Studio, Firebase Hosting (optional), Cloud Storage (for media)

---

## 🚀 Getting Started

### ✅ Prerequisites

Make sure you have the following installed:

* **Git:** [Download Git](https://git-scm.com/)
* **Node.js:** [Download Node.js](https://nodejs.org/)
* **Code Editor:** VS Code (Recommended)

### ✅ Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Alpha-Soumen/sudarshan_code.git
   ```

2. **Navigate into the project directory:**

   ```bash
   cd sudarshan_code
   ```

3. **Install dependencies:**

   ```bash
   npm install
   # Or
   yarn install
   # Or
   pnpm install
   ```

4. **Configuration (Firebase Setup):**

   * Create a file named `.env.local` in the project root.
   * Add your Firebase configuration:

     ```dotenv
     NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
     NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
     ```
   * Replace the placeholders with your actual Firebase configuration.

### ✅ Running Locally

Start the development server:

```bash
npm run dev
# Or
yarn dev
# Or
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🚀 Building for Production

To create a production-ready build:

```bash
npm run build
# Or
yarn build
# Or
pnpm build
```

### ✅ Deploying on Vercel

1. Connect your GitHub repository to Vercel.
2. Set your environment variables in Vercel settings.
3. Deploy with a single click.

---

## 🌐 Live Demo

[EduEvent Hub on Vercel](https://event-management-system-7fal84ugy-sudarshs-projects.vercel.app/)

---



### 🚀 Future Enhancements

* ✅ Enhanced search and filtering options.
* ✅ Advanced user authentication (OAuth with Google, Facebook).
* ✅ Real-time chat support for event discussions.
* ✅ Admin dashboard for event management.
* ✅ Analytics dashboard for tracking user engagement.

---


## 🤝 Contributing

We welcome contributions from the community.

### ✅ How to Contribute:

1. **Fork the repository.**
2. **Create a new branch:**

   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes.**
4. **Commit your changes:**

   ```bash
   git commit -m "Add your feature description"
   ```
5. **Push to your branch:**

   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request.**

### 📌 Contribution Guidelines:

* Follow the project’s coding style.
* Ensure your code is well-documented.
* Write meaningful commit messages.
* Keep pull requests focused on a single feature or fix.

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE.md](LICENSE.md) file for more details.

---

## 👨‍💻 Developed By:

* **Rohit Roy:** [LinkedIn](https://www.linkedin.com/in/rohit-roy-ur-welcome/)
* **Soumen Bhunia:** [LinkedIn](https://www.linkedin.com/in/soumen-bhunia-2b8799293/)
* **Bishal Biswas:** [LinkedIn](https://www.linkedin.com/in/bishal-biswas-9a5679293/)
* **Bhargav Pandit:** [LinkedIn](https://www.linkedin.com/in/bhargav-pandit-85694a217/)

---




