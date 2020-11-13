function split(list, chunksNumber) {
  // mimic a cumsum
  const s = [0,[]]

  for(let i = 0; i<list.length;i++) {
    s[0]+= i[1]
    s[1].push(s[0])
  }

  // now scan the lists populating the chunks
  let index = 0
  let splitted = []
  let stop = 0
  let chunk = 1

  for(let i = 0; i < list.length; i++) {
    if (s[1][i] >= stop) {
      splitted.push(w_list[index:i+1]) // register a new chunk
    }
  }

  for i in range(len(w_list)):
    # print(stop, s[1][i])     # uncomment for traces
    if s[1][i] >= stop:        # reached a stop ?
        splitted.append(w_list[index:i+1])    # register a new chunk
        index = i+1
        chunk += 1
        if chunk == n_chunks:                 # ok we can stop
            break
        stop = s[0] * chunk / n_chunks        # next stop
  splitted.append(w_list[index:])               # do not forget last chunk
  
  return splitted
}

// def split(w_list, n_chunks):
//     # mimic a cumsum
//     s = [0,[]]
//     for i in w_list:
//         s[0]+= i[1]
//         s[1].append(s[0])
//     # now scan the lists populating the chunks
//     index = 0
//     splitted = []
//     stop = 0
//     chunk = 1
//     stop = s[0] / n_chunks
//     for i in range(len(w_list)):
//         # print(stop, s[1][i])     # uncomment for traces
//         if s[1][i] >= stop:        # reached a stop ?
//             splitted.append(w_list[index:i+1])    # register a new chunk
//             print(splitted)
//             index = i+1
//             chunk += 1
//             if chunk == n_chunks:                 # ok we can stop
//                 break
//             stop = s[0] * chunk / n_chunks        # next stop
//     splitted.append(w_list[index:])               # do not forget last chunk
//     return splitted
    
    
// print(split([[1,2], [2,2], [3,3], [5,5], [3,3]], 2))