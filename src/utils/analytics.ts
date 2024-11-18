// src/utils/analytics.ts
import axios from 'axios';
import { getSessionId, getUserId } from './session';

export function trackEvent(eventType: string, productId: number) {
    const sessionId = getSessionId();
    const userId = getUserId();

    const payload: any = {
        session_id: sessionId,
        event_type: eventType,
        product_id: productId,
    };

    if (userId) {
        payload.user_id = userId;
    }

    axios.post('/api/track-event', payload)
        .then(response => {
            console.log('Event tracked successfully');
        })
        .catch(error => {
            console.error('Failed to track event:', error);
        });
}

export function trackPageView(pageUrl: string) {
    const sessionId = getSessionId();
    const userId = getUserId();

    const payload: any = {
        session_id: sessionId,
        event_type: 'page_view',
        page_url: pageUrl,
    };

    if (userId) {
        payload.user_id = userId;
    }

    axios.post('/api/track-event', payload)
        .then(response => {
            console.log('Page view tracked');
        })
        .catch(error => {
            console.error('Failed to track page view:', error);
        });
}
