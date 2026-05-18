export interface Shipment {
  id?: string;
  trackingNumber: string;
  status: string;
  stage?: string;
  isPaused: boolean;
  holdReason: string;
  paymentStatus?: string;
  estimatedDelivery: string;
  verified?: boolean;
  lastUpdated?: string;
  sender: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state?: string;
    country: string;
    postal?: string;
  };
  receiver: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state?: string;
    country: string;
    postal?: string;
  };
  package: {
    title: string;
    description?: string;
    weight: string;
    quantity: number;
    category?: string;
    shippingMethod: string;
    deliveryType?: string;
    fragile?: boolean;
    priority: string;
  };
  origin: {
    city: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  destination: {
    city: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  current: {
    city: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  createdAt: any;
  updatedAt: any;
  dutyFees?: string;
  pickupDate?: string;
  clearanceFee?: string;
  images?: string[];
}

export interface TrackingUpdate {
  id?: string;
  status: string;
  location: string;
  description: string;
  timestamp: any;
  comment?: string;
}
