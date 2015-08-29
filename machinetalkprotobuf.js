var ProtoBuf = require('protobufjs');

var builder = ProtoBuf.loadProtoFile({
	// TODO: Search in /usr/include, /usr/local/include, etc for machinetalk-protobuf
	root: '/home/bob/projects/machinetalk-protobuf/src',
	file: 'machinetalk/protobuf/message.proto'
});

module.exports = {
	Container: builder.build('pb.Container'),
	ContainerType: builder.build('pb.ContainerType')
};