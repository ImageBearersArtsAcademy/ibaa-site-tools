import * as st from 'simple-runtypes';

export const WebhookPayload = st.record({
	triggerType: st.string(),
	payload: st.any(),
})
