import {INIT_DATA} from './mutations_types'

export default{
    state:{
        list: []
    },
    actions:{

    },
    mutations:{
        [INIT_DATA](state, arrPath){
            state.list = arrPath
        }
    },
    getters:{
        defaultPath(state){
            return state.list.filter(v => {
                return v.isDefault == 1
            })
        }
    },
    modules:{

    },
}