import { reactive } from 'vue';

const globalState = reactive({
    userinfo: {
        fullname: 'Demo Template User',
        username: 'admin@template.local',
        type: 'admin',
        is_admin: true,
        status: 3,
        depositBalance: 150000000,
        subUnitName: 'UI TEMPLATE STARTER KIT'
    },
    title: "",
    unreadNotifCount: 3,
    getPermission: function (moduleName) {
        // Standalone Template Mode: Full permission granted for all modules
        return { iscreate: true, isupdate: true, isdelete: true, isread: true, isprint: true };
    }
});

export default globalState;