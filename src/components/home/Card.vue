<template>
	<div class="title">
		<slot>
			<span>爆款推荐</span>
		</slot>
	</div>
</template>

<script>
export default {
	name: 'Card',
	data() {
		return {
			
		}
	},
}
</script>

<style>
	.title{
		padding: 8px 0;
		width: 100%;
		text-align: center;
		font-size: 16px;
	}
	
	.title span{
		position: relative;
	}
	
	.title span::after{
		content: '';
		position: absolute;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		display: block;
		background-color: #d4c0a7;
		top: 50%;
		margin-top: -4px;
		right: -0.5rem;
	}
	
	.title span::before{
		content: '';
		position: absolute;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		display: block;
		background-color: #d4c0a7;
		top: 50%;
		margin-top: -4px;
		left: -0.5rem;
	}
</style>