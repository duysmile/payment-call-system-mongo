# How do I design payment system for call center?

### My problem

Mình đang xây dựng một hệ thống voicebot dùng để tạo cuộc gọi đến user để thu thập thông tin hoặc quảng bá cho một chiến dịch marketing nào đó. Khách hàng sử dụng nền tảng bên mình sẽ có thể nạp tiền vào tài khoản của họ trong hệ thống và thực hiện chiến dịch gọi ra này.

Vấn đề đặt ra là làm sao để **giới hạn số lượng cuộc gọi dựa trên số tiền còn lại trong tài khoản của khách hàng**.

Đối với người dùng thông thường, việc quản lí cuộc gọi dựa trên số tiền trong tài khoản khá đơn giản. Vì một *số điện thoại* chỉ có thể thực hiện một cuộc gọi trong cùng một thời điểm, nên từ số tài khoản ta có thể dễ dàng tính ra thời gian cuộc gọi tối đa ngay từ khi bắt đầu và có thể set thời hạn tối đa cho cuộc gọi đó. Trong trường hợp đặc biệt khi đang thực hiện *cuộc gọi*, mà tài khoản được nạp thêm tiền thì thông qua event `nạp tiền` cũng có thể cập nhật lại thời lượng tối đa này.

Nhưng bài toán đối với call center lại khác, ở chỗ mỗi số điện thoại tổng đài có thể tạo được nhiều cuộc gọi cùng lúc. Điều này dẫn đến việc sử dụng thời lượng được tính trước sẽ rất khó khăn. Vì vậy cần một giải pháp để kiểm soát số cuộc gọi và thời lượng dựa trên số tiền trong tài khoản của mỗi `khách hàng`.

Đầu tiên mình nghĩ tới cách sau mỗi cuộc gọi sẽ cập nhật số tiền trong tài khoản lại, như vậy thì có thể biết được khi bắt đầu cuộc gọi tài khoản có đủ tiền hay không. Nghe hợp lí nhỉ 🤔 nhưng nếu nghĩ kĩ thì sẽ có rất nhiều vấn đề nếu làm theo cách này:
- Thứ nhất nếu thời lượng cuộc gọi vượt quá thời lượng có thể gọi với số tiền trong tài khoản thì ta sẽ không kiểm soát được, nếu như hệ thống có cho ghi nợ thì mới có thể cân nhắc bỏ qua việc này, nhưng lại phải thêm khá nhiều thứ lằng nhằng để xử lí việc ghi nợ này.
- Thứ hai là nếu trong trường hợp có nhiều hơn hai cuộc gọi của khách hàng kết thúc cùng lúc thì việc cập nhật lại số tiền trong tài khoản cũng có thể bị `conflict`.
- Cuối cùng là nếu số tiền trong tài khoản chỉ đủ để thực hiện 1 cuộc gọi nhưng có nhiều hơn 2 cuộc gọi bắt đầu cũng lúc thì vẫn có thể bypass được case này một cách ngon lành.

Vậy cần làm gì cho thỏa đáng đây??? Câu hỏi này khiến mình đau đầu hết 30p liền 🤯.

Và rồi ... Tadaaa mình đã nghĩ ra cách để kiểm soát lại việc tính toán số dư tài khoản và chi phí cuộc gọi.
Cùng xem nhé!

Để mọi thứ đơn giản thì mình dùng cách giới hạn số cuộc gọi có thể tạo ngay từ đầu, bằng cách quy định mỗi cuộc gọi sẽ có thời lượng tối đa là `MAX` (ở đây nếu cuộc gọi không giới hạn thời lượng thì có thể dùng cách tính tiền theo từng block và xử lý mỗi khi hết một block).

Và khi có được `MAX` cùng với số cuộc gọi được thực hiện, chúng ta biết được khoảng tiền tối đa cần phải trả cho những cuộc gọi này. Từ đó mình có thể tính được khoảng estimate cost cho toàn bộ những cuộc gọi này để biết được tài khoản có cho phép tạo cuộc gọi hay không. Perfecttt !!! Mình quá thông minh 😌. Dù sẽ có những bất cập nhưng vẫn là không đáng kể so với việc đảm bảo hệ thống vận hành trơn tru và đặc biệt là không bị `mất tiền oan` 😂

Nào, bây giờ thì bắt tay vào làm thôi 😎

Đầu tiên, cách dễ nhất là khi có thông tin cuộc gọi, ta tính được chi phí, lấy dữ liệu của tài khoản từ DB sau đó kiểm tra xem khoản chi phí này có vượt quá số dư hiện tại không, nếu không thì cập nhật chi phí dự tính này vào DB và thực hiện gọi, nếu có thì reject yêu cầu này luôn. Yahh, clear rồi phải không, vậy thì code thôi.

```
// Kiểm tra và update estimate cost khi bắt đầu gọi
{
	const account = await AccountModel.findOne({
		name: userName,
	});

	if (account.estimate + costEstimatePerCall > account.balance) {
		return false;
	}

	currentCalls += 1;
	console.log('START: current calls:', currentCalls);
	await AccountModel.updateOne({
		name: userName,
	}, {
		$inc: { estimate: costEstimatePerCall },
	});
	return true
}
...

// Sau khi gọi thành công, cập nhật chi phí thực tế và hoàn lại estimate cost
{
	await AccountModel.updateOne({
		name: userName,
	}, {
		$inc: {
			estimate: -costEstimatePerCall,
			balance: -costEstimatePerCall,
		},
	});
}
```

Thiệt là đơn giản, xong xuôi 😌 à khoann, có gì đó không ổn, sao lại dễ dàng như vậy được.
Đúng rồi, cách làm trên nhìn thì ok, nhưng vấn đề là khi có nhiều concurrent request cùng tạo cuộc gọi trên tài khoản này thì sẽ phát sinh vấn đề liền:
- Trong khoảng thời gian từ khi get dữ liệu ra, kiểm tra cho đến khi update estimate cost, nếu khi đó cũng có 1 request khác tạo cuộc gọi thì phần kiểm tra sẽ bị sai ngay, dẫn đến gọi quá *lố*.

Vậy thì phải tìm cách để việc update estimate cost là 1 atomic operation (còn cái này là gì thì bạn tự gg nhé). Và sau khi tìm đọc doc của Mongo thì `update` operation trong MongoDB là atomic function. Bây giờ là cần tìm cách để đưa điều kiện update vào dựa trên estimate cost là được.

Mình sẽ cần thông tin của `balance` - số dư hiện tại, `estimate` - khoản tiền dự tính hiện tại, `estimateCostPerCall` - khoản tiền tối đa phải trả để thực hiện gọi theo yêu cầu. Từ đó ta có được biểu thức cần áp dụng: `balance >= estimate + costEstimatePerCall`. Giờ làm sao đưa biểu thức này vào điều kiện update trong MongoDB đây? Mình cũng không biết, nên đành nhờ vào bác Google tiếp thôi :)).

Và sau một hồi tìm kiếm, chân ái cuộc đời mình chính là `$where`, mình có thể truyền vào 1 function với JS syntax và MongoDB sẽ dùng JS engine để thực thi nó. Nên lưu ý là trong trường hợp này mình đã tìm được chính xác document cần cập nhật, nếu không thì việc bật JS engine và thực thi script trên mỗi document sẽ ảnh hưởng rất lớn đến performance. Mình sẽ implement cách này như sau:
```
const nUpdate = await AccountModel.updateOne({
	name: userName,
	$where: `function() {
		return this.balance >= this.estimate + ${costEstimatePerCall};
	}`,
}, {
	$inc: { estimate: costEstimatePerCall },
});

if (nUpdate.nModified == 0) {
	return false;
}

return true;
```

Giờ thì thật sự là xong rồi 😎 cảm giác như được khai sáng. Mọi người có thể xem full source của ví dụ này ở repo này nhé. Cảm ơn mọi người đã kiên nhẫn đọc hết những lời nhảm nhí này của mình. Byeee 👮‍♀️.

À quên, để hướng dẫn mn chạy thử cái demo chứ :))
```
// cài package
npm install

// chạy con server quần què lên
node index.js

// tạo data
node create-account.js

// giả lập request concurrent
./run.sh

/*
 * chỉnh sửa api /jobs-normal, /jobs-atomic để xem sự khác biệt, nhớ sửa data trong DB lại nhé, mình lười lắm nên ko viết sẵn đâu 😌
*/
```

Có thể tham khảo thêm locking ở đây nhé!
Manual locking: https://medium.com/pragmatic-programmers/concurrency-with-mongodb-explained-79f09ef80ad8
