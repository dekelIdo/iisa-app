export interface AgeGroupData {
  [key: string]: number;
}

export interface CityData {
  [key: string]: number;
}

export interface ChartDataset {
  data: number[];
  backgroundColor: string | string[];
  label?: string;
}

export interface ChartConfig {
  labels: string[];
  datasets: ChartDataset[];
}
