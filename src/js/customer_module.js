Vue.component('my-upload', {
    template: '<div class="my-upload" style="width:auto" :class="__disabled()">'
    + '<button class="el-button--small  el-button " :disabled="disabled" :class="_class()" @click="handleClick"><slot>上传文件</slot> </button>'
    + '<input class="el-upload__input myel-upload__input" type="file" ref="input" @change="_onChange" :accept="accept"></input>'
    + '</div>',
    props: {
        multiple: {
            type: [String, Boolean]
        },
        accept: {
            type: String,
            default: ''
        },
        change: Function,
        type: {
            type: String,
            default: 'primary'// type="success"
        },
        disabled: [String, Boolean]
    },
    methods: {
        _onChange: function (e) {
            this.change(e.target);
            // this.$emit('change',e.target)
        },
        handleClick: function () {
            var el = this.$refs.input;
            if (el) el.click();
        },
        submit: function () {
            console.log('submit');
        },
        _class: function () {
            return { "el-button--primary": this.type === "primary", "el-button--success": this.type === "success", "is-disabled": this.disabled }
        },
        __disabled: function () {
            return { 'el-input is-disabled': this.disabled }
        }
    }
})
Vue.component('my-excle-note', {
    template: '<div><div>注意：</div>' +
    '<ul>' +
    ' <li>从Excle导入的产品，必须是已经存在的产品，不然导入失败</li>' +
    '<li>模板格式是不是正确，重复编号的产品只去第一条</li>' +
    '<li>Excle里的数据格式是否在正确，请确认您输入的日期格式、数字格式、编号、中英文符号是否正确</li>' +
    '</ul></div>'
})
Vue.component('my-query-filter', {
    template: '<div flex flexbox flex-center>' +
    '<label for="" style="margin:0 10px 0 40px">输入产品条形码</label>' +
    '<section flex="" class="el-input el-input--small">' +
    '<input autocomplete="off" placeholder="筛选/查询" @blur="handleBlur" @focus="handleFocus" @input="handleInput" :value="currentValue" v-bind="$props" size="small" type="text" @keyup.enter="handleKeyEnter" class="el-input__inner query--input">' +
    '</section>' +
    '</div>',
    props: {
        value: [String, Number],
        disabled: Boolean,
    },
    watch: {
        'value'(val, oldValue) {
            this.setCurrentValue(val);
        }
    },
    data: function () {
        return {
            currentValue: this.value
        }
    },
    methods: {
        handleKeyEnter: function (e) {
            this.$emit('keydown-enter', e);
        },
        handleInput(event) {
            var value = event.target.value;
            this.$emit('input', value);
            this.setCurrentValue(value);
        },
        setCurrentValue(value) {
            if (value === this.currentValue) return;
            this.currentValue = value;
        },
        handleBlur(event) {
            this.$emit('blur', event);
        },
        handleFocus(event) {
            this.$emit('focus', event);
        },
    }
})

