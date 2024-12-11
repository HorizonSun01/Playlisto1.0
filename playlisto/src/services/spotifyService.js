class SpotifyService {
  constructor() {
    this.accessToken = null;
  }

  setAccessToken(token) {
    this.accessToken = token;
  }

  async fetchUserPlaylists() {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=5', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user playlists');
      }

      const data = await response.json();
      if (data && data.items) {
        console.log("data", data);
        return data.items
          .filter(playlist => playlist !== null && playlist.id && playlist.name)
          .map(playlist => ({
            id: playlist.id,
            name: playlist.name,
            tracks: playlist.tracks.total,
            uri: playlist.uri,
            isUserPlaylist: true
          }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      throw error;
    }
  }

  async fetchFeaturedPlaylists() {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=5', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch featured playlists');
      }

      const data = await response.json();

      if (data && data.playlists && data.playlists.items) {
        return data.playlists.items
          .filter(playlist => playlist !== null && playlist.id && playlist.name)
          .map(playlist => ({
            id: playlist.id,
            name: playlist.name,
            tracks: playlist.tracks.total,
            uri: playlist.uri,
            isUserPlaylist: false
          }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching featured playlists:', error);
      throw error;
    }
  }
}

const spotifyService = new SpotifyService();
export default spotifyService;
