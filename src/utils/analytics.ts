// src/utils/analytics.ts
import axios from 'axios';
import { getSessionId, getUserId } from './session';

export function trackEvent(eventType: string, productId: number) {
    const sessionId = getSessionId();
    const userId = getUserId();

    axios.post('/api/track-event', {
        session_id: sessionId,
        user_id: userId,
        event_type: eventType,
        product_id: productId,
    })
    .then(response => {
        console.log('Event tracked successfully');
    })
    .catch(error => {
        console.error('Failed to track event:', error);
    });
}

export function trackPageView(pageUrl: string) {
    const sessionId = getSessionId();

    axios.post('/api/track-event', {
        session_id: sessionId,
        event_type: 'page_view',
        page_url: pageUrl,
    })
    .then(response => {
        console.log('Page view tracked');
    })
    .catch(error => {
        console.error('Failed to track page view:', error);
    });
}
