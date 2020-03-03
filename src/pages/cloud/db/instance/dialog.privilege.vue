<template>
  <el-dialog :title="form.title"
             :visible.sync="form.visible">
    <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
    <div style="margin: 15px 0;"></div>
    <el-checkbox-group v-model="checkedPrivileges" @change="handleCheckedPrivilegesChange">
      <el-checkbox v-for="privilege in privileges" :label="privilege" :key="privilege">{{privilege}}</el-checkbox>
    </el-checkbox-group>
  </el-dialog>
</template>

<script>
  // API
  // eslint-disable-next-line no-unused-vars
  import { queryBusinessTag, queryTagPage, updateTagBusiness } from '@api/tag/tag.js'

  const privilegeOptions = ['ReadOnly', 'ReadWrite', 'DDLOnly', 'DMLOnly']

  export default {
    data () {
      return {
        checkAll: false,
        // checkedPrivileges: ['ReadOnly'],
        privileges: privilegeOptions,
        isIndeterminate: true
      }
    },
    name: 'dialog-privilege',
    props: {
      form: {},
      checkedPrivileges: []
    },
    mixins: [],
    mounted () {
    },
    methods: {
      handleCheckAllChange (val) {
        this.checkedPrivileges = val ? privilegeOptions : []
        this.isIndeterminate = false
      },
      handleCheckedPrivilegesChange (value) {
        let checkedCount = value.length
        this.checkAll = checkedCount === this.privileges.length
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.privileges.length
      },
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
              this.$emit('closePrivilegeDialog')
            })
        }, 600)
      }
    }
  }
</script>
