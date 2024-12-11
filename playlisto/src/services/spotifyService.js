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
      const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user playlists');
      }

      const data = await response.json();
      return data.items.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        tracks: playlist.tracks.total,
        uri: playlist.uri,
        isUserPlaylist: true
      }));
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
      const response = await fetch('https://api.spotify.com/v1/browse/featured-playlists?limit=20', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch featured playlists');
      }

      const data = await response.json();
      return data.playlists.items.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        tracks: playlist.tracks.total,
        uri: playlist.uri,
        isUserPlaylist: false
      }));
    } catch (error) {
      console.error('Error fetching featured playlists:', error);
      throw error;
    }
  }
}

const spotifyService = new SpotifyService();
export default spotifyService;
