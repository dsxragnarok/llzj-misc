const fs = require('fs');

fs.readFile('./db_lang.bytes', (err, data) => {
  if (err)  {
    console.error(err);
    return;
  }

  let s = stringFromUTF8Array(data[4]);

  console.log('4: [', data[4], '] --- type of ', typeof data[4]);
  for (let idx = 0; idx < data.length; idx += 1) {
    console.log(`${data[idx]} | `)
  }

  fs.writeFile('./out.bytes', data, (err) => {
    if (err) {
      console.err(err);
      return;
    }
  });
});

function stringFromUTF8Array(data)
{
  const extraByteMap = [ 1, 1, 1, 1, 2, 2, 3, 0 ];
  var count = data.length;
  var str = "";

  for (var index = 0;index < count;)
  {
    var ch = data[index++];
    if (ch & 0x80)
    {
      var extra = extraByteMap[(ch >> 3) & 0x07];
      if (!(ch & 0x40) || !extra || ((index + extra) > count))
        return null;

      ch = ch & (0x3F >> extra);
      for (;extra > 0;extra -= 1)
      {
        var chx = data[index++];
        if ((chx & 0xC0) != 0x80)
          return null;

        ch = (ch << 6) | (chx & 0x3F);
      }
    }

    str += String.fromCharCode(ch);
  }

  return str;
}
