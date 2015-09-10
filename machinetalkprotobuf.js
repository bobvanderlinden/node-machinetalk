var ProtoBuf = require('protobufjs');
var path = require('path');
var fs = require('fs');
var child_process = require('child_process');

function findDirectory(directories, file) {
	return directories
		.filter(function(directoryPath) { return !!directoryPath; })
		.filter(function(directoryPath) { return fs.existsSync(path.join(directoryPath, file)); })
		[0];
}

var builder = ProtoBuf.loadProtoFile({
	root: findDirectory([
		process.env.PROTOBUF_INCLUDE,
		child_process.execSync('pkg-config --variable=includedir protobuf').toString(),
		'/home/bob/projects/machinetalk-protobuf/src',
		'/home/bob/projects/machinetalk-protobuf/proto',
		'/usr/include',
		'/usr/local/include',
	], 'machinetalk/protobuf/message.proto'),
	file: 'machinetalk/protobuf/message.proto'
});

module.exports = {
	Container: builder.build('pb.Container'),
	ContainerType: builder.build('pb.ContainerType')
};