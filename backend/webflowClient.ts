import 'dotenv/config';
import Webflow from 'webflow-api';
import * as st from 'simple-runtypes';

const api = new Webflow({ token: process.env.WEBFLOW_API_TOKEN, beta: true });

const siteId = '6535c587a24c9a3fff171b46';

const StudentInfo = st.dictionary(
	st.string(),
	st.array(st.dictionary(
		st.string(),
		st.string()
	))
);

const Order = st.record({
	raw: st.any(),
	orderId: st.string(),
	parentName: st.string(),
	parentEmail: st.string(),
	studentsInfo: StudentInfo,
});

const Orders = st.array(Order);

type Orders = ReturnType<typeof Orders>;

export async function listOrders(): Promise<Orders> {
	const result = await api.get(`/sites/${siteId}/orders?status=unfulfilled`);

	if (!result.data.orders) {
		return [];
	}

	return Orders(result.data.orders?.map((order: any) => ({
		raw: order,
		orderId: order.orderId,
		parentName: order.customerInfo.fullName,
		parentEmail: order.customerInfo.email,
		studentsInfo: StudentInfo(JSON.parse(order.customData?.find((x: any) => x.name === 'Notes')?.textArea)),
	})));
}
