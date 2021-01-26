<template>
  <div>
    <el-card class="box-card" shadow="never" style="margin-top: 10px">
      <div slot="header" class="clearfix">
        <span>SSH密钥<i class="header-icon el-icon-info"></i>(堡垒机,Gitlab)</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="editSSHKey">编辑</el-button>
      </div>
      <div>
        <el-tag v-if="userDetail.credentialMap != null && userDetail.credentialMap.sshPubKey != null"
                style="margin-left: 5px">
          {{ userDetail.credentialMap.sshPubKey.title }}
          {{ userDetail.credentialMap.sshPubKey.fingerprint }}
        </el-tag>
        <el-tooltip class="item" effect="light" content="堡垒机公钥已推送" placement="top"
                    v-show="userDetail.attributeMap != null && userDetail.attributeMap.jumpserverPubkey">
          <el-tag type="success" style="margin-left: 5px">堡垒机</el-tag>
        </el-tooltip>
        <el-tooltip class="item" effect="light" content="Gitlab公钥已推送" placement="top"
                    v-show="userDetail.attributeMap != null && userDetail.attributeMap.gitlabPubkey">
          <el-tag type="success" style="margin-left: 5px">Gitlab</el-tag>
        </el-tooltip>
      </div>
    </el-card>
    <user-ssh-key-dialog :formStatus="formUserSSHKeyStatus" ref="userSSHKeyDialog"
                         @fetchData="fetchData"></user-ssh-key-dialog>
  </div>
</template>

<script>
import UserSshKeyDialog from '@/components/opscloud/dialog/UserSSHKeyDialog'

export default {
  data () {
    return {
      formUserSSHKeyStatus: {
        visible: false,
        labelWidth: '100px',
        title: '编辑SSH公钥'
      }
    }
  },
  props: ['userDetail'],
  name: 'UserDetailSshCard',
  components: {
    UserSshKeyDialog
  },
  methods: {
    editSSHKey () {
      // form
      let userSSHKey = {}
      if (this.userDetail.credentialMap.sshPubKey != null) {
        userSSHKey = Object.assign({}, this.userDetail.credentialMap.sshPubKey)
      } else {
        userSSHKey = {
          id: '',
          userId: this.formUserDetail.id,
          username: this.formUserDetail.username,
          title: '',
          credential: '',
          credentialType: 2 // ssh pub-key
        }
      }
      this.$refs.userSSHKeyDialog.initData(userSSHKey)
      this.formUserSSHKeyStatus.visible = true
    },
    fetchData () {
      this.$emit('fetchData')
    }
  }
}
</script>

<style scoped>

</style>
