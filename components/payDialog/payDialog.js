// components/payDialog/payDialog.js
const appPay = getApp();
var isCaling = false; //是否在计时中
var countdownSmsCode;
var totalTime = 30;
var isCloseJump=true;
var payMethodId = ''; //选择的支付方式
var payDemandId = '';//需求ID
var payOrderId = ''; //订单id
var payOrderNo = ''; //订单编号
var payAmount=0;//订单总价
var payDescribe = ''; //BODY描述类信息
var returnMsg = 'cancel';//关闭弹框的方式，cancel取消的时候关闭；confirm支付成功关闭
var payfunCalSuc;

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    showPayMethodPopup: false, //是否显示选择支付方式列表
    balVisible:false,//弹出余额支付输入验证码框
    phone:'',
    thePhone:'',//带*的手机号
    smsCode: '',//短信验证码
    disabledSmsCode: false, //是否屏幕获取验证码点击事件
    smsCodeHint: '获取验证码', //按键提示
    animationData: {},
    payMethodList: [{ //支付方式列表数据
        id: 'WeChatPay',
        name: '微信支付',
        balance: '',
        balanceHint: '',
        icon: '/images/icon/wechat_icon.png',
        isCheck: false,
        isClick:true
      },
      {
        id: 'balancePay',
        name: '余额支付',
        balance:0.00,
        balanceHint:'',
        icon: '/images/icon/balance_icon.png',
        isCheck: false,
        isClick: false
      }
    ],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 关闭选择支付方式列表
     */
    colsePayMethod(e) {
      // 隐藏遮罩层
      var animation = wx.createAnimation({
        duration: 200,
        timingFunction: "linear",
        delay: 0
      })
      this.animation = animation
      animation.translateY(300).step()
      this.setData({
        animationData: animation.export(),
      })
      setTimeout(function() {
        animation.translateY(0).step()
        this.setData({
          animationData: animation.export(),
          showPayMethodPopup: false
        })
      }.bind(this), 200);
      if (isCloseJump) {
        //选择微信支付返回结果回调
        payfunCalSuc(returnMsg);
      }
    },

    /**
     * 选择支付方式
     */
    choosePay(e) {
      var id = e.currentTarget.dataset.id; //支付ID
      var position = e.currentTarget.dataset.index; //列表下标
      var isClick = e.currentTarget.dataset.isclick; //禁止点击
      if (!isClick) return;
      var payMethodList = this.data.payMethodList;
      for (var index in payMethodList) {
        if (index == position) {
          payMethodId = payMethodList[index].id;
          payMethodList[index].isCheck = true;
        } else {
          payMethodList[index].isCheck = false;
        }
      }
      this.setData({
        payMethodList: payMethodList
      });
    },

    /**
     * 确定支付方式
     */
    confirmPayMethod(e) {
      var that = this;
      if (payMethodId == 'WeChatPay') {
        //微信支付 BODY描述类信息
        var param = "ORDER_ID=" + payOrderId + "&ORDER_NO=" + payOrderNo + "&openid=" + appPay.globalData.openId + "&BODY=" + payDescribe +"&WORK_FLAG=1";
        console.log('支付：'+param)
        wx.showLoading();
        appPay.httpsPlatformClass('xiPay', param,
          function(res) {
            console.log('appPay:' + JSON.stringify(res));
            //成功
            var resultObj = res.msg;
            if (typeof resultObj == 'object' && resultObj) {
              //如果是json对象,不用做处理
            } else {
              //如果是json字符串，则需要处理成json对象
              if (resultObj == '' || resultObj == null) {} else {
                resultObj = JSON.parse(resultObj);
              }
            }
            var retInfo = resultObj.info;
            var timeStamp = retInfo.timeStamp;
            var nonceStr = retInfo.nonceStr;
            var packageStr = retInfo.package;
            var signType = retInfo.signType;
            var paySign = retInfo.paySign;
            //  var prepay_id = retInfo.prepay_id;

            wx.requestPayment({
              timeStamp: timeStamp,
              nonceStr: nonceStr,
              package: packageStr,
              signType: signType,
              paySign: paySign,
              success(res) {
                if (res.errMsg == "requestPayment:ok") {
                  wx.showModal({
                    title: '支付提示',
                    content: '支付成功',
                    showCancel: false,
                    success: res => {
                      returnMsg = 'confirm';
                      isCloseJump=true;
                      that.colsePayMethod();
                    }
                  })
                } else {
                  wx.showModal({
                    title: '支付提示',
                    content: JSON.stringify(res),
                    showCancel: false,
                    success: res => {}
                  })
                }

              },
              fail(res) {
                if (res.errMsg == "requestPayment:fail cancel") {

                } else {
                  wx.showModal({
                    title: '支付失败',
                    content: JSON.stringify(res),
                    showCancel: false,
                    success: res => {}
                  })
                }
              }
            })
          },
          function(returnFrom, res) {
            //失败
          }
        );
      } else if (payMethodId == 'balancePay') {
        //余额支付
        isCloseJump = false;
        that.colsePayMethod();
        that.setData({ balVisible: true })
      } else {
        wx.showModal({
          title: '提示',
          content: '请先选择支付方式',
          showCancel: false,
          success: res => {}
        })
      }
     
    },

    /**
   * 开始计时
   */
    startCountDown: function () {
      var than = this;
      countdownSmsCode = setTimeout(function () {
        totalTime--;
        if (totalTime < 1) {
          isCaling = false; //计时结束
          than.setData({
            disabledSmsCode: false,
            smsCodeHint: '重新获取',
          });
          clearTimeout(countdownSmsCode)
        } else {
          isCaling = true; //正在计时
          than.setData({
            smsCodeHint: totalTime + '秒后重发'
          });
          than.startCountDown();
        }
      }, 1000);
    },

    /**
     * 获取短信验证码
     */
    getSmsCodeTap: function (e) {
      var that = this;
      if(!appPay.checkPhone(this.data.phone)){
        wx.showToast({ title: '手机号格式不正确', icon: 'none', duration: 2000 })
        return;
      }
      if (this.data.disabledSmsCode) return;
      var param = 'phone=' + that.data.phone + '&type=5' + '&openId=' + appPay.globalData.openId + '&from=3'; //type:1注册，2登录，3修改密码，4信息变更,5余额支付
      appPay.httpsDataGet('/user/getSmsVerify', param,
        function (res) {
          //成功
          totalTime = 30;
          that.setData({
            disabledSmsCode: true,
            smsCodeHint: totalTime + '秒后重发'
          });
          that.startCountDown();
        },
        function (returnFrom, res) {
          //失败
        }
      )
    },

    /**
   * 监听输入验证码
   */
    bindSmsCodeInput: function (e) {
      this.setData({
        smsCode: e.detail.value
      })
    },

    /**余额支付确认 */
    handleOk:function(){
      if (this.data.smsCode.length==4){
        this.setData({
          balVisible: false
        });
        clearTimeout(countdownSmsCode)
        this.balancePayMethod();
      } else{
        wx.showToast({ title: '请输入四位短信验证码', icon: 'none', duration: 2000 })
      }
    },

    /**余额支付取消 */
    handleClose() {
      clearTimeout(countdownSmsCode)
      this.setData({
        balVisible: false
      });
      returnMsg = 'cancel';
      payfunCalSuc(returnMsg);
    },


    /**
     * 余额支付
     */
    balancePayMethod:function(){
      // var param={};
      // param.id = payDemandId
      // param.userId = appPay.globalData.userId
      // param.orderId = payOrderId
      // param.phone=this.data.phone
      // param.verifyCode = this.data.smsCode
      wx.showLoading();

      var param = 'id=' + payDemandId + '&userId=' + appPay.globalData.userId + '&orderId=' + payOrderId + '&phone=' + this.data.phone + '&verifyCode=' + this.data.smsCode + '&totalFee=' + payAmount
      
      console.log('balancePayparam:' + param);

      //生成订单
      appPay.httpsDataGet('/worker/balancePay', param,
        function (ret) {
          console.log('balancePay:' + JSON.stringify(ret));
          //成功
          if (ret.status){
            wx.showModal({
              title: '支付提示',
              content: '支付成功',
              showCancel: false,
              success: res => {
                returnMsg = 'confirm';
                payfunCalSuc(returnMsg);
              }
            })
          }
        },
        function (ret) {
          //失败
          wx.hideLoading();
          wx.showModal({
            title: '支付失败',
            content: '验证码不对或已失效',
            showCancel: false,
            success: res => {
            }
          })
        }
      );
    },

    /**
     * 显示支付列表
     * orderId 订单id
     * orderNo 订单编号
     * amount 订单总价
     * describe 支付描述String(128)
     * funCalSuc 支付成功结果回调
     * isCloseJump 关闭弹框是否跳转到下一页面 true 是，false否
     * jumpUrl 跳转页面的url，在isCloseJump为true生效
     */
    showPayDialog(demandId,orderId, orderNo, amount, describe, funCalSuc) {
      
      var that = this;
      isClick: false
      appPay.getAccountBalance(function (res) {
        var balance = "payMethodList[" + 1 + "].balance";
        var balanceHint = "payMethodList[" + 1 + "].balanceHint";
        var isClick = "payMethodList[" + 1 + "].isClick";
        
        var retIsClick = Number(amount) > Number(res) ? false : true;
        var retBalanceHint = Number(amount) > Number(res) ? '余额不足' : '';
        that.setData({
          [balance]: res,
          [balanceHint]: retBalanceHint,
          [isClick]: retIsClick
        })
      });
      isCloseJump = true;
      returnMsg = 'cancel';
      payDemandId = demandId;//需求id
      payOrderId = orderId; //订单id
      payOrderNo = orderNo; //订单编号
      payAmount = amount; //订单总价
      // payDescribe = describe.length > 128 ? describe.substring(0, 125) + '...' : describe;//BODY描述类信息
      payDescribe ='确认报价';//BODY描述类信息
      payfunCalSuc = funCalSuc;

      // 显示遮罩层(弹出支付方式)
      var animation = wx.createAnimation({
        duration: 200,
        timingFunction: "linear",
        delay: 0
      })
      this.animation = animation
      animation.translateY(300).step()
      var p = appPay.globalData.phone
      var thePhone = p.substr(0, 3) + '****' + p.substr(7, 4)
      this.setData({
        animationData: animation.export(),
        showPayMethodPopup: true,
        phone:appPay.globalData.phone,
        thePhone: thePhone,
        smsCode:'',
        disabledSmsCode: false,
        smsCodeHint: '获取验证码',
      })

      setTimeout(function() {
        animation.translateY(0).step()
        this.setData({
          animationData: animation.export()
        })
      }.bind(this), 200)
    }
  }
})