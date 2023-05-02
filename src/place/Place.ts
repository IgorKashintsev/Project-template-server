export interface Place {
  id: number;
  image: string;
  name: string;
  description: string;
  coordinates: number[];
  remoteness: number;
  bookedDates: number[];
  price: number;
} 
