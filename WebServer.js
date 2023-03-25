//Simple test program that creates the serverlist Array and adds/removes elements from that array.

//------------------------------------ Initializers for Attributes of Web Server
//Changed everything into OOP
//I feel like I'm coding in C now lmao

export default class WebServer {
  constructor() {
    this.MAXSIZE = 10;
    this.server0 = [];
    this.server1 = [];
    this.server2 = [];
    this.serverlist = [this.server0, this.server1, this.server2];
    this.serverStatus = [true, true, true];
    this.queue = [];
    this.blockedIPs = [];
  }

  // ----------------------------------- End of Initializer

  //------------------------------------ Method implementation

  //getServerStatus(server)
  getServerStatus = (serveri) => {
    return this.serverStatus[serveri];
  };

  getServerList = () => {
    return this.serverlist;
  };

  displayServerList = (serveri) => {
    return this.serverlist[serveri];
  };

  getQueueCapacity = () => {
    return this.queue.length;
  };

  //toggleStatus(server)
  toggleStatus = (serveri) => {
    this.serverStatus[serveri] = !this.getServerStatus(serveri);
  };

  getServerCapacity = (serveri) => {
    return this.serverlist[serveri].length;
  };

  /*
   * getAvailableServer will return the next available server to put a user in
   * It returns 0, 1, 2, or false if no servers are available
   * @param1 - serverLogic will indicate the priority of the servers:
   * 1 - Prioritize adding to the lowest server
   * 2 - Prioritize every server EXCEPT 0
   * 3 - Prioritize every server getting to 50% first
   */
  getAvailableServer = (serverLogic) => {
    // If serverlogic == 1, we prioritize adding to the lowest server
    if (serverLogic === 1) {
      // Track the server with the lowest capacity and it's index
      let minIndex = 0;
      let minCapacity = this.getServerCapacity(0);

      for (let i = 0; i < this.serverlist.length; i++) {
        if (
          this.getServerCapacity(i) < minCapacity &&
          this.getServerStatus(i)
        ) {
          minIndex = i;
          minCapacity = this.getServerCapacity(i);
        }
      }

      // Return the lowest capacity server, unless it is at max capacity
      if (minCapacity < 10) {
        return minIndex;
      }
    }

    // If serverLogic == 2, then prioritize filling up servers 1 and 2 before server0
    if (serverLogic === 2) {
      // If server's 1 and 2 are full OR server1 and server2 are offline
      if (
        (this.serverStatus[1] === false && this.serverStatus[2] === false) ||
        (this.getServerCapacity(1) >= 10 && this.getServerCapacity(2) >= 10)
      ) {
        //return server0 if it's online
        if (this.serverStatus[0] && this.getServerCapacity(0) < 10) {
          return 0;
        }
      } else {
        if (this.serverStatus[1] && this.getServerCapacity(1) < 10) {
          return 1;
        }
        if (this.serverStatus[2] && this.getServerCapacity(2) < 10) {
          return 2;
        }
      }
    }

    // If serverlogic == 3, then prioritize getting every server to 50% before filling all servers to max capacity
    if (serverLogic === 3) {
      let minIndex = 0;
      let minCapacity = this.serverlist[0].length;
      for (let i = 0; i < this.serverlist.length; i++) {
        if (
          this.getServerCapacity(i) < this.MAXSIZE * 0.5 &&
          this.getServerStatus(i)
        ) {
          return i;
        } else if (
          this.getServerCapacity(i) < minCapacity &&
          this.getServerStatus(i)
        ) {
          minCapacity = this.getServerCapacity(i);
          minIndex = i;
        }
      }

      if (minCapacity < 10) {
        return minIndex;
      }
    }

    return false; // All servers are full
  };

  // Block IP
  blockIP = (userIP) => {
    if (userIP.length > 0) {
      this.blockedIPs.push(userIP);
      console.log(`User IP ${userIP} blocked`);
    }
  };

  // Check if IP is blocked
  IPblocked = (userIP) => {
    if (this.blockedIPs.indexOf(userIP) !== -1) {
      return true;
    }
    return false;
  };

  registerNewUser = (userIP, serverLogic) => {
    var availserver = this.getAvailableServer(serverLogic);
    if (this.IPblocked(userIP)) {
      //alert("IP has been Blocked");
      console.log(`UserIP ${userIP} blocked`);
      return;
    } else if (availserver === false) {
      //0 is considered false, so we MUST use === to prevent 0 == false errors.
      //if no servers are available, then getAvailableServer returns false
      this.redirectUser(userIP, "queue");
    } else {
      this.redirectUser(userIP, availserver);
    }
  };

  redirectUser = (userIP, serveri) => {
    if (serveri == "queue") {
      console.log(`user moved to queue`);
      this.queue.push(userIP);
    } else {
      console.log(`registered user IP ${userIP}`);
      this.serverlist[serveri].push(userIP);
    }
  };

  removeUser = (userIP) => {
    // Boolean to keep track of whether we cannot remove due to an offline server or if the user was not found
    let serverOffline = false;
    for (let i = 0; i < this.serverlist.length; i++) {
      let index = this.serverlist[i].indexOf(userIP);
      // If the userIP is found in the server
      if (index !== -1) {
        // Check the server status
        if (this.getServerStatus(i) === false) {
          serverOffline = true;
          console.log(`Unable to remove userIP ${userIP}. Server ${i} offline`);
        }
        // If user is found and server is online, remove them and return
        else {
          console.log(`User IP ${userIP} removed`);
          this.serverlist[i].splice(index, 1);
          return;
        }
      }
    }

    // If server was online, and we did not return yet (in other words, we have not removed the user)
    // Then it was because the user was not found
    if (!serverOffline) {
      console.log(`Unable to remove userIP ${userIP}. userIP cannot be found`);
    }
  };

  ///Testing case: creating temp servers and trying to addnew users.

  // Helper method for printing our server lists
  printwebservers = () => {
    for (let i = 0; i < p1.getServerList().length; i++) {
      console.log(`serverlist[${i}] = [ ${p1.displayServerList(i)} ]`);
    }
  };

  /*
   * Test function will add x users to the servers
   * @param1 - serverLogic:
   * 1 - Prioritize adding to the lowest server
   * 2 - Prioritize server 0
   * 3 - Prioritize every server getting to 50% first
   * @param2 - Number of times to add
   * ex: testWebServer(3, 30) -> will run 30 times, each iteration adds a person to the correct server depending on the given logic
   */
  testWebServer = (serverLogic, x) => {
    let randomNumber = 0;
    for (let i = 0; i < x; i++) {
      // The actual maxsize of all webservers combined would be MAXSIZE * the number of servers
      // so we'll have a 2:1 ratio of adding more users to removing users until we almost reach max capacity
      if (i < this.MAXSIZE * this.getServerList.length - 0.5) {
        randomNumber = Math.floor(Math.random() * 3) + 1;
      }
      // Once our webservers are almost at max capacity, we can swap back to 1:1 ratio of adding to removing
      // Where our randomNumber will indicate whether we add or remove
      else {
        randomNumber = Math.floor(Math.random() * 2) + 1;
      }

      if (randomNumber === 1) {
        this.registerNewUser("8", serverLogic);
      } else if (randomNumber === 2) {
        this.removeUser("8");
      } else {
        this.registerNewUser("8", serverLogic);
      }

      this.printwebservers();
      console.log(`queue = ${this.queue}\n`);
    }

    this.printwebservers();
  };
}
