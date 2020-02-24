<template>
  <el-dialog :title="form.title"
             :visible.sync="form.visible">
    <el-form :model="tag">
      <el-transfer v-model="tag.serverTag"
                   :props="{ key: 'id', label: 'tagKey' }"
                   :data="tag.tagOptions"
                   :titles="['所有标签', '服务器标签']">
      </el-transfer>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="form.visible = false">关闭</el-button>
      <el-button type="primary" size="mini" @click="saveItem">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  // API
  // eslint-disable-next-line no-unused-vars
  import { queryBusinessTag, queryTagPage, updateTagBusiness } from '@api/tag/tag.js'

  export default {
    data () {
      return {
      }
    },
    name: 'dialog-tag',
    props: {
      form: {},
      tag: {
        businessId: '',
        businessType: '',
        serverTag: [],
        tagOptions: []
      }
    },
    mixins: [],
    mounted () {
    },
    methods: {
      handleClick () {
        this.$emit('input', !this.value)
      },
      saveItem () {
        setTimeout(() => {
          var requestBody = {
            'businessType': this.tag.businessType,
            'businessId': this.tag.businessId,
            'tagIds': this.tag.serverTag
          }
          updateTagBusiness(requestBody)
            .then(res => {
              // 返回数据
              this.$message({
                message: '成功',
                type: 'success'
              })
              this.form.visible = false
              this.$emit('closeTagDialog')
            })
        }, 600)
      }
    }
  }
</script>
