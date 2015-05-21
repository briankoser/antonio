using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using bgg_users_want.Models;

namespace bgg_users_want.Controllers
{
    [EnableCors(origins: "http://koser.us", headers: "*", methods: "*")]
    public class GameController : ApiController
    {
        public IHttpActionResult GetGame(int id)
        {
            var game = new Game(id);

            if (game == null)
            {
                return NotFound();
            }
            return Ok(game);
        }
    }
}
