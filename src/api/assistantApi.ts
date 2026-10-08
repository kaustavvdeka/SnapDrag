import api from './client.js';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AssistantProductSummary {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountedPrice: number;
  discountPercent: number;
  material: string;
  color: string;
  size: string;
  availableQuantity: number;
  inStock: boolean;
  primaryImage: string;
  categoryName: string;
  categorySlug: string;
  shop: {
    id: string;
    name: string;
    slug: string;
    rating: number;
    phone: string;
    city: string;
    address: string;
    mallName?: string;
    floorName?: string;
    shopNumber?: string;
  };
}

export interface AssistantShopSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  rating: number;
  reviewCount: number;
  phone: string;
  openingHours: string;
  city: string;
  address: string;
  mallName?: string;
  floorName?: string;
  shopNumber?: string;
  section?: string;
  nearbyLandmark?: string;
  indoorDirections?: string;
  productCount: number;
}

export interface AssistantChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  context?: {
    userLocation?: {
      city?: string;
      lat?: number;
      lng?: number;
    };
    currentProductId?: string;
    activeFilters?: Record<string, any>;
  };
}

export interface AssistantChatResponse {
  success: boolean;
  message?: string;
  data: {
    reply: string;
    products: AssistantProductSummary[];
    shops: AssistantShopSummary[];
    availability?: any;
    intent: string;
    activeFilters: Record<string, any>;
    suggestedQuickActions: string[];
  };
}

export const sendAssistantMessage = async (
  request: AssistantChatRequest
): Promise<AssistantChatResponse> => {
  const response = await api.post('/assistant/chat', request);
  return response as unknown as AssistantChatResponse;
};

export default {
  sendAssistantMessage,
};
