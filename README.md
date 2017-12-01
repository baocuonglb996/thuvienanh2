# Khởi tạo moongodb để chạy project thuvienanh
## 1. Cách tiến hành.
- download theo link dưới đây
  https://drive.google.com/open?id=1caTrlWXIZP1PvEFxrnV1o3gCycEGlIiK
- Lưu ý cách này chỉ thực hiện trên window.
- Sau khi giải nén file moongodb_sharing.rar chúng ta sẽ có hai folder ở trong con trong nó là data và MongoDB. Chúng ta copy hoặc cắt folder data vào ổ C ( link của nó có dạng C:\data\db ), folder còn lại thì nên để vào ổ C:\Program Files hoặc bất kỳ ổ nào cũng được.
- Sau khi hoàn thành chúng ta bắt đầu khởi động server.
Mở cửa sổ cmd ra gõ cd đến folder db và gõ mongod 
- Sau khi khởi động thành công server chúng ta sẽ mở thêm một command prompt mới ( window + r => gõ cmd ) cd đến thư mục thuvienanh và các bạn gõ npm install  để cài đặt các module cần thiết.
- Và bước cuối cùng là chúng ta khởi chạy chương trình. Gõ npm start rồi enter.
Khi chương trình chạy thì ta gõ vào trình duyệt locahost:3000 để vào  chương trình.
