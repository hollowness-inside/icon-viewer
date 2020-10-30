var fs = require('fs');

class Stream {
    constructor(buffer) {
        this.buffer = buffer;
        this.p = 0;
    }

    readUInt16() {
    	var readed = this.buffer.readUInt16LE(this.p);
    	this.p += 2;
    	return readed;
    }

    read(size) {
    	var readed = this.buffer.slice(this.p, this.p + size);
    	this.p += size;
    	return readed;
    }
}

function main(path) {
	var buffer = fs.readFileSync(path);
	var stream = new Stream(buffer);

    sidebar.innerHTML = "";
    sidebar.size = "0";

    stream.p += 2;
    icoInfo.innerText = "ICO file info\n";
    icoInfo.innerText += "\nType: " + stream.readUInt16();
    var images_num = stream.readUInt16();
    icoInfo.innerText += "\nNumber of images: " + images_num;

    for (var i = 0; i < images_num; i++) {
        var option = document.createElement('option');
        var header = stream.read(16);

        option.data_width = header.readUInt8(0) || 256;
        option.data_height = header.readUInt8(1) || 256;
        option.data_palette = header.readUInt8(2);
        option.data_planes = header.readUInt16BE(4);
        option.data_bpp = header.readUInt16LE(6);
        option.data_size = header.readUInt32LE(8);
        option.data_offset = header.readUInt32LE(12);

        old_offset = stream.p;
        stream.p = option.data_offset;
        var img_data = stream.read(option.data_size);
        stream.p = old_offset;

        header.set([22, 0, 0, 0], 12);
        header = concatenate(new Uint8Array([0, 0, 1, 0, 1, 0]), header);
        var data = concatenate(header, img_data);
        option.data_data = data;

        option.innerText = `${option.data_width}x${option.data_height}`;
        sidebar.appendChild(option);
        sidebar.size = parseInt(sidebar.size) + 1;
    }

    selected(sidebar);
}

function selected(nav) {
    var option = nav.selectedOptions[0];

    selectedInfo.innerText = "Selected image info\n";
    selectedInfo.innerText += "\nWidth: " + option.data_width;
    selectedInfo.innerText += "\nHeight: " + option.data_height;
    selectedInfo.innerText += "\nPalettes: " + option.data_palette;
    selectedInfo.innerText += "\nPlanes: " + option.data_planes;
    selectedInfo.innerText += "\nBits Per Pixel: " + option.data_bpp;
    selectedInfo.innerText += "\nSize: " + option.data_size;
    selectedInfo.innerText += "\nOffset: " + option.data_offset;

    var blob = new Blob([option.data_data]);
    var src = window.URL.createObjectURL(blob);
    image1.src = image2.src = src;
}

function concatenate(buffer1, buffer2) {
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp;
}

var image1 = document.getElementById("image1");
var image2 = document.getElementById("image2");
var sidebar = document.getElementById("sidebar");
var drop_zone = document.getElementById('drop-zone');

var icoInfo = document.querySelector("#info #ico");
var selectedInfo = document.querySelector("#info #chosen");

drop_zone.ondragover = () => false;
drop_zone.ondragleave = () => false;
drop_zone.ondragend = () => false;

drop_zone.ondrop = (e) => {
	e.preventDefault();

	drop_zone.firstElementChild.innerText = "Processing...";
	main(e.dataTransfer.files[0].path);
	drop_zone.style.display = "none";
	drop_zone.firstElementChild.innerText = "Drop an icon here";

	return false;
};

document.body.ondragover = function() {
	drop_zone.style.display = 'flex';
}

// (function() {
// 	document.body.dragover = () => false;
// 	document.body.ondragleave = () => false;
// 	document.body.ondragend = () => false;

// 	document.body.ondrop = () => {
// 		drop_zone.style.display = 'flex';

// 		return false;
// 	};
// })();