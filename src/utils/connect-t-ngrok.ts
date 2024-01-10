import * as ngrok from 'ngrok';

export async function connectToNgrok() {
  return ngrok.connect(3000);
}
