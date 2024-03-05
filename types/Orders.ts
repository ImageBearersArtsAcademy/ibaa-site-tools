import * as st from 'simple-runtypes';

const StudentInfoField = st.record({
	value: st.string(),
	column: st.nullOr(st.string()),
});

const StudentInfo = st.dictionary(
	st.string(),
	st.array(st.dictionary(st.string(), StudentInfoField))
);

export const Order = st.record({
	raw: st.any(),
	orderId: st.string(),
	parentName: st.string(),
	parentEmail: st.string(),
	studentsInfo: StudentInfo,
});
export type Order = ReturnType<typeof Order>;

export const Orders = st.array(Order);
export type Orders = ReturnType<typeof Orders>;
