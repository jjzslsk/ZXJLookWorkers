// pages/postStep/postStep.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classList:[],//所有类别数据
    optionId:'',
    optionName:'',

    currentDetail:[],//当前页类别
    currentPicked: '',//当前页类别选中的选项对象
    currentPickedIndex: '',//当前页类别选择的选项index

    pickedData:[],//所有选择的选项id及name的对象
    pickedIndex:1,//对象的index

    firstStep:true,

    stepItem:[],//步骤记录对象
    postType:'postByClass',
    workerId:'',
    workerName:'',
    loadDone:false,

    showWorkerClass:false,
    workerClass:''
  },

  pickItem: function (e) {
    var index = e.currentTarget.dataset.index
    var id = e.currentTarget.dataset.id
    var name = e.currentTarget.dataset.name

    var item = this.data.currentDetail
    for(var i=0;i<item.length;i++){
      item[i].picked = false
    }
    //设置选中状态及当前选择项
    item[index].picked=true
    this.setData({
      currentDetail: item,
      currentPicked:{
        clientClassId:id,
        className:name
      },
      currentPickedIndex:index
    });
   
        
  },


  prevStep: function (e) {
    var stepItem = this.data.stepItem
    var pickedData = this.data.pickedData
    var pickedIndex = this.data.pickedIndex-1
    var firstStep = false

    stepItem.splice((stepItem.length-1),1)
    pickedData.splice((pickedData.length - 1), 1)

    var currentDetail = stepItem[stepItem.length - 1].data    
    for (var i = 0; i < currentDetail.length; i++) {
      currentDetail[i].picked = false
    }
    if (stepItem.length==1){
      firstStep=true
    }

    this.setData({
      currentDetail: currentDetail,
      firstStep: firstStep,
      currentPicked: '',
      currentPickedIndex: '',
      pickedData: pickedData,
      pickedIndex: pickedIndex,
      stepItem: stepItem
    });
  },

  nextStep: function (e) {  
    //判断有无当前选择项
    if (this.data.classList.length>0){
      var currentPicked = this.data.currentPicked
      if (!currentPicked){
        wx.showToast({
          title: '请先选择一个选项',
          icon: 'none',
          duration: 2000
        })
        return
      }

      var pickedData = this.data.pickedData
      var pickedIndex = this.data.pickedIndex + 1
      pickedData[pickedIndex] = this.data.currentPicked
      var stepItem = this.data.stepItem

      var that = this;
      wx.showLoading({
        title: '加载中',
      })
      var param = 'parentId=' + currentPicked.clientClassId;
      app.httpsDataGet('/worker/getWorkerChild', param,
        function (res) {
          // console.log('getWorkerChild2:' + JSON.stringify(res));
          //成功
          if (res.data && res.data.length > 0) {      
            var siLength = stepItem.length      
            var si={}
            si.data=res.data
            stepItem[siLength] = si

            that.setData({
              currentDetail: res.data,
              firstStep: false,
              currentPicked: '',
              currentPickedIndex: '',
              pickedData: pickedData,
              pickedIndex: pickedIndex,
              stepItem: stepItem
            });

          } else {
            that.setData({
              pickedData: pickedData,
              pickedIndex: pickedIndex
            });
            var picked_str = JSON.stringify(that.data.pickedData)
            wx.navigateTo({
              url: '/pages/postRequire/postRequire?type=' + that.data.postType + '&pickedItem=' + picked_str + '&workerId=' + that.data.workerId + '&workerName=' + that.data.workerName
            })
          }

        },
        function (returnFrom, res) {
          //失败
          wx.hideLoading()
        }
      )
    }else{
      var item = {
        clientClassId: this.data.optionId,
        className: this.data.optionName
      }
      var items = []
      items[0] = item
      var item_str = JSON.stringify(items)
      wx.navigateTo({
        url: '/pages/postRequire/postRequire?type=' + this.data.postType + '&pickedItem=' + item_str + '&workerId=' + this.data.workerId + '&workerName=' + this.data.workerName
      })
    }
  },

  pickWorkerClass: function (e) {
    var id = e.currentTarget.dataset.id
    var name = e.currentTarget.dataset.name

    var pickedData = this.data.pickedData    

    pickedData[0] = {
      clientClassId: id,
      className: name
    }

    this.setData({
      optionId: id,
      optionName: name,
      pickedData: pickedData
    })
    
    this.initChildClass()
  },

  initChildClass: function (e) {
    var pickedData = this.data.pickedData    
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    var param = 'parentId=' + this.data.optionId;
    app.httpsDataGet('/worker/getWorkerChild', param,
      function (res) {
        that.setData({
          loadDone: true
        })
        //成功
        if (res.data && res.data.length > 0) {
          var stepItem = []
          var si = {}
          si.data = res.data
          stepItem[0] = si

          that.setData({
            showWorkerClass:false,
            classList: res.data,
            currentDetail: res.data,
            stepItem: stepItem
          });
        } else {
          var item_str = JSON.stringify(pickedData)
          wx.navigateTo({
            url: '/pages/postRequire/postRequire?type=' + that.data.postType + '&pickedItem=' + item_str + '&workerId=' + that.data.workerId + '&workerName=' + that.data.workerName
          })
        }

      },
      function (returnFrom, res) {
        that.setData({
          loadDone: true
        })
        //失败
        wx.hideLoading()
      }
    )

  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {   
    var id = options.id
    var name = options.name

    if(id=='ALL'){
      var workerClass = JSON.parse(options.workerClass)
      this.setData({
        showWorkerClass:true,
        workerClass: workerClass,
        postType: 'book',
        workerId: options.workerId,
        workerName: options.workerName,
        pickedIndex: 0
      })
    }else{
      var pickedData = this.data.pickedData   
      
      wx.setNavigationBarTitle({
        title: name
      })

      if(options.type=='book'){
        pickedData[0] = {
          clientClassId: id,
          className: name
        }
        this.setData({
          postType:'book',
          workerId: options.workerId,
          workerName: options.workerName,
          pickedIndex:0
        })
      }else{
        var pid = options.pid
        var pname = options.pname

        pickedData[0] = {
          clientClassId: pid,
          className: pname
        }
        pickedData[1] = {
          clientClassId: id,
          className: name
        }
      }     

      this.setData({
        optionId: id,
        optionName: name,
        pickedData: pickedData
      })

      this.initChildClass()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.loadDone && this.data.classList.length==0){
      wx.navigateBack({
        delta: 1
      })
    }else{
      if (this.data.loadDone){

        var pickedData = this.data.pickedData
        var pickedIndex = this.data.pickedIndex - 1
        
        pickedData.splice((pickedData.length - 1), 1)

        var currentDetail = this.data.currentDetail
        for (var i = 0; i < currentDetail.length; i++) {
          currentDetail[i].picked = false
        }

        this.setData({
          currentDetail: currentDetail,      
          currentPicked: '',
          currentPickedIndex: '',
          pickedData: pickedData,
          pickedIndex: pickedIndex
        });

      }
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})