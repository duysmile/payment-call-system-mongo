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

... to be continued~~~


