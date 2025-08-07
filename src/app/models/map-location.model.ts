export interface MapLocation {
  city: string;
  coordinates: [number, number];
}

export interface CityCoordinates {
  [key: string]: [number, number];
}
