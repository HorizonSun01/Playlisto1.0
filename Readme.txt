Playlisto - Game Documentation
Introduction
Game Name: Playlisto
Genre: Browser-based Multiplayer Guessing Game
Primary Objective:
Playlisto is a multiplayer, turn-based guessing game where players listen to a random song from a selected Spotify playlist and try to guess its name as quickly as possible. The game rewards speed and accuracy, offering a competitive, fun environment for up to 12 players.

Game Mechanics
Gameplay Overview
Players are divided into rooms, each with a host and multiple players (1-12).
The host connects to Spotify, selects one or more playlists, and starts the game.
During the game, the host selects a song, and all players must guess its title before time runs out.
The time for each round is determined by the host and is adjustable between 0.5 and 20 seconds.
The game ends after a set number of rounds, with scores displayed on a final scoreboard.
Controls and Input
Song Playback: The host controls when the song is played by pressing a button to start the track.
Guessing: Players input their guesses into a search engine-style interface where they can type the song name from the playlist list.
Error Feedback: If a player guesses wrong, an error message appears informing them of the incorrect guess.
Time Limit: Each round is time-limited based on the stopper (countdown timer), and players earn points for guessing the song correctly before time runs out.
Score: Players are awarded 500 points divided by the remaining time on the stopper (rounded up).
Example: A correct guess at 0.5 seconds awards 1000 points, while a correct guess at 2 seconds awards 250 points.
Winning and Ending the Game
The game ends after a predetermined number of rounds.
A scoreboard is displayed at the end of the game, showing the top 5 players' scores.
Players click anywhere to close the scoreboard and return to the room screen.
Game Environment
Setting and Visual Style
Background: The game’s environment features a dynamic, flowing background resembling colored gas that transitions smoothly. This provides an immersive atmosphere without distracting from the gameplay.
User Interface:
A minimalist design with buttons for "Start Game," "Join Room," and "Daily Challenge."
The "Daily Challenge" button leads to a pop-up with a “Coming soon…” message.
Scoreboard displayed at the bottom right, showing up to 5 players, scrollable for more.
Room and Game Layout
Home Screen: Displays options for starting a game, joining a room, or accessing the daily challenge.
Room Screen: Players can see the list of current participants and selected playlists. Only the host can start the game after all players are ready.
Game Screen: Shows the current round, song being played, the score of each player, and a countdown timer (stopper). Players input their guesses into a search bar.
End of Game: After the game ends, the scoreboard shows, and a click anywhere on the screen transitions back to the room.
Development Details
Technical Stack
Frontend: React.js
Handles user interface, routing between different game states (home screen, room screen, game screen), and real-time multiplayer updates.
Styled using custom CSS with the color palette of blue, light blue, purple, and pink for a captivating, yet non-distracting design.
Backend: Node.js with Express.js
Provides the server-side logic, manages game state, and handles WebSocket connections for real-time multiplayer functionality.
Communicates with Spotify’s API for song selection and playback.
WebSockets: Used for real-time communication between players in the same room. This ensures that every action (song playing, guess updates, scores) is synchronized across all clients.
Spotify Integration
Authentication: The game uses Spotify's API for playlist access. The host must log in via Spotify before starting a room, and the game pulls available playlists from their account.
Song Selection: After the host selects a playlist, songs are chosen randomly for each round of the game.
Multiplayer System
Players: Between 1 and 12 players can join a room. The host manages the playlist selection and can adjust the round timer.
Room Codes: When the host starts the game, a unique room code is generated, and players can join by entering this code.
Host Change: If the host leaves the room, the first player to join takes over the host duties after a 30-second wait.
Release Information
Platforms
The game is a browser-based application and will be available on all major browsers (Chrome, Firefox, Safari, Edge) for both desktop and mobile devices.
Launch and Marketing
Initial Launch: After development and testing, the game will be released to the public as a free-to-play web app.
Promotion: The game will be promoted through social media platforms and relevant online communities, particularly those interested in music-based games.
User Feedback
Players will be encouraged to provide feedback to improve the game, such as adding new playlists or game features.


