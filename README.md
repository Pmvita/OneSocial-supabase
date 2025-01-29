<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

<!-- [![Contributors][contributors-shield]][contributors-url] -->
[![LinkedIn][linkedin-shield]][linkedin-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/github_username/repo_name">
    <img src="./images/OneSocial.png" alt="Logo" width="200" height="150" borderRadius="0" />
  </a>

<h3 align="center">OneSocial</h3>

  <p align="center">
    Made by: Pierre Mvita
    <br />
    Date: 01/2025
    <br />
    <a href="https://github.com/github_username/repo_name"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/github_username/repo_name">View Demo</a>
    ·
    <a href="https://github.com/github_username/repo_name/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/github_username/repo_name/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://example.com)

This project is a cross-platform Social media, messaging, and crypto wallet app built using React Native and Expo. It features supabase authentication, messaging, and wallet functionality.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![React][React.js]][React-url]
* [![ReactNative][ReactNative.js]][ReactNative-url]
* [![Expo][Expo.io]][Expo-url]
* [![Supabase][Supabase.io]][Supabase-url]
<!-- * [![Next][Next.js]][Next-url] -->
<!-- * [![Vue][Vue.js]][Vue-url] -->
<!-- * [![Angular][Angular.io]][Angular-url] -->
<!-- * [![Svelte][Svelte.dev]][Svelte-url] -->
<!-- * [![Laravel][Laravel.com]][Laravel-url] -->
<!-- * [![Bootstrap][Bootstrap.com]][Bootstrap-url] -->
<!-- * [![JQuery][JQuery.com]][JQuery-url] -->

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

* Node.js
  ```sh
  node -v
  ```
* npm
  ```sh
  npm install npm@latest -g
  ```
* Yarn
  ```sh
  yarn -v
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Pmvita/OneSocial-supabase.git
   ```
2. Install Yarn packages
   ```sh
   yarn install
   ```
3. Change git remote url to avoid accidental pushes to base project
   ```sh
   git remote set-url origin github_username/repo_name
   git remote -v # confirm the changes
   ```
4. Change the supabasefile.ts file to match your supabase project details:
  - lib/supabase
5. Start the app
   ```sh
   yarn start
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

<div align="center">
  <table>
    <tr>
    <!-- Cross-platform Welcome Screen -->
      <td>
        <img 
          src="./images/ios-ss1.png" 
          alt="iOS Welcome Screen" 
          width="100" 
          height="auto"
        />
        <img 
          src="./images/and-ss1.png" 
          alt="Android Welcome Screen" 
          width="100" 
          height="auto"
        />
      </td>
      <!-- Cross-platform Login Screen -->
      <td>
        <img
          src="./images/ios-ss2.png" 
          alt="iOS Sign-In Screen" 
          width="100"
          height="auto"
        />
        <img
          src="./images/and-ss2.png"
          alt="Android Sign-In Screen" 
          width="100" 
          height="auto"
        />
      </td>
      <!-- Cross-platform Sign-Up Screen -->
      <td>
        <img
          src="./images/ios-ss3.png"
          alt="iOS Sign-Up Screen"
          width="100"
          height="auto"
        />
        <img
          src="./images/and-ss3.png"
          alt="Android Sign-Up Screen"
          width="100"
          height="auto"
        />
      </td>
      <!-- Cross-platform ForgotPassword Screen -->
      <td>
        <img src="./images/ios-ss4.png" 
          alt="iOS Forgot Password Screen"
          width="100"
          height="auto"
        />
        <img src="./images/and-ss4.png" 
          alt="Android Forgot Password Screen"
          width="100"
          height="auto"
        />
      </td>
    </tr>
    <!-- Cross-platform Home Screen -->
    <tr>
      <td>
        <img
          src="./images/ios-ss5.png"
          alt="Home Screen"
          width="100"
          height="auto"
        />
        <img
          src="./images/and-ss5.png"
          alt="Home Screen"
          width="100"
          height="auto"
        />
      </td>
      <!-- Cross-platform Messages Screen -->
      <td>
        <img 
          src="./images/ios-ss6.png"
          alt="Messages Screen"
          width="100"
          height="auto"
        />
        <img 
          src="./images/and-ss6.png"
          alt="Messages Screen"
          width="100"
          height="auto"
        />
      </td>
      <!-- Cross-platform Wallet Screen -->
      <td>
        <img 
          src="./images/ios-ss7.png"
          alt="Wallet Screen"
          width="100"
          height="auto"
        />
        <img 
          src="./images/and-ss7.png"
          alt="Wallet Screen"
          width="100"
          height="auto"
        />
      </td>
      <!-- Cross-platform Settings Screen -->
      <td>
        <img
          src="./images/ios-ss8.png"
          alt="Settings Screen"
          width="100"
          height="auto"
        />
        <img
          src="./images/and-ss8.png"
          alt="Settings Screen"
          width="100"
          height="auto"
        />
      </td>
    </tr>
  </table>
</div>

_For more examples, please refer to the [Documentation](https://example.com)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [ ] **Feature 1**: *Authentication*
  - Supabase: Email and password authentication.
- [ ] **Feature 2**: *Real-time Database*
  - Supabase: Real-time updates.
- [ ] **Feature 3**: *Crypto Wallet*:  
   - Supabase: Wallet functionality.
   - Supabase: Crypto balance.
   - Updatable balance withing db.
- [ ] **Feature 4**: *Notifications*:  
   - Push notifications using Expo.
   - Toast notifications.
- [ ] **Feature 5**: *Cloud Functions*:  
   - Supabase: Cloud functions.
- [ ] **Feature 6**: *Image Upload*:  
   - Supabase: Image upload.
   - Within settings you can upload your profile picture, using a link.
- [ ] **UI Feature's**:
   - Loader component
   - Bottom Tabs
   - Vector Icons

See the [open issues](https://github.com/github_username/repo_name/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Top contributors:

<!--
<a href="https://github.com/github_username/repo_name/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=github_username/repo_name" alt="contrib.rocks image" />
</a>
-->



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Pierre Mvita - [@twitter_handle](https://twitter.com/twitter_handle) - PeterMvita@hotmail.com

Project Link: [https://github.com/Pmvita/OneSocial-supabase.git](https://github.com/Pmvita/OneSocial-supabase.git)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* []()
* []()
* []()

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/github_username/repo_name.svg?style=for-the-badge
[contributors-url]: https://github.com/github_username/repo_name/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/github_username/repo_name.svg?style=for-the-badge
[forks-url]: https://github.com/Pmvita/OneSocial-supabase/forks
[stars-shield]: https://img.shields.io/github/stars/github_username/repo_name.svg?style=for-the-badge
[stars-url]: https://github.com/Pmvita/OneSocial-supabase/stargazers
[issues-shield]: https://img.shields.io/github/issues/github_username/repo_name.svg?style=for-the-badge
[issues-url]: https://github.com/github_username/repo_name/issues
[license-shield]: https://img.shields.io/github/license/github_username/repo_name.svg?style=for-the-badge
[license-url]: https://github.com/Pmvita/OneSocial-supabase/blob/main/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/pierre-mvita/
[product-screenshot]: ./images/title.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[ReactNative.js]: https://img.shields.io/badge/ReactNative-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[ReactNative-url]: https://reactnative.dev/docs/environment-setup
[Expo.io]: https://img.shields.io/badge/Expo-555555?style=for-the-badge&logo=expo&logoColor=white
[Expo-url]: https://docs.expo.dev/guides/overview/#expo-router
[Supabase.io]: https://img.shields.io/badge/Supabase-00C7B7?style=for-the-badge&logo=supabase&logoColor=white
[Supabase-url]: https://supabase.io
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 
