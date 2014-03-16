var views = document.querySelectorAll('div.view');

function changeView() {
	var selView = this.getAttribute('data-view');
	var view = document.querySelectorAll('#viewCnt div.'+selView)[0];

	//console.log(view);
	view.style.display = view.style.display=='block'?'none':'block';
}

for(var i=0;i<views.length;i++) {
	var vb = views[i];
	vb.addEventListener('click',changeView,false);
}