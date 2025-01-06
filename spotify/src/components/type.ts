export type Song = {
    id: string;
    title: string;
    artist: string;
    album: string;
    duration: number;
    thumbnailUrl: string;
    preview_url: string;
    uri:string;
    genre:string;// Add this if missing in the type
};
