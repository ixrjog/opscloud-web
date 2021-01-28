<template>
  <div>
    <el-carousel height="150px" v-if="isShow && JSON.stringify(announcementData) !== '[]'" style="margin-bottom: 15px"
                 :interval="interval">
      <el-carousel-item v-for="announcement in announcementData" :key="announcement.id">
        <el-row>
          <b>{{ announcement.title }}</b>
          <el-button type="text" style="float: right;color: #409EFF;padding: 20px 20px 0 0" @click="handlerClick()">知道了
          </el-button>
        </el-row>
        <p v-html="announcement.content"></p>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script>
import { queryValidOcAnnouncement } from '@api/announcement/announcement'

export default {
  data () {
    return {
      announcementData: [],
      isShow: false,
      interval: 8 * 1000
    }
  },
  name: 'AnnouncementCarousel',
  mounted () {
    this.fetchData()
  },
  methods: {
    handlerClick () {
      this.isShow = false
    },
    fetchData () {
      this.isShow = false
      queryValidOcAnnouncement()
        .then(res => {
          this.announcementData = res.body
          this.isShow = true
        })
    }
  }

}
</script>

<style scoped>
.el-carousel__item b {
  color: #475669;
  font-size: 15px;
  opacity: 0.75;
  line-height: 50px;
  margin: 0;
  margin-left: 50px;
}

.el-carousel__item p {
  margin-left: 50px;
  font-size: 14px;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n+1) {
  background-color: #d3dce6;
}

</style>
