using Fizzler.Systems.HtmlAgilityPack;
using HtmlAgilityPack;
using HtmlDoc = HtmlAgilityPack.HtmlDocument;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Threading;

namespace bgg_users_want.Models
{
    public class Game
    {
        public int ID { get; private set; }
        public List<User> UsersWant { get; set; }

        public Game(int id)
        {
            ID = id;
            UsersWant = GetUsersWantList(id);
        }

        public Game(int id, List<User> usersWant)
        {
            ID = id;
            UsersWant = usersWant;
        }

        private List<User> GetUsersWantList(int id)
        {
            var htmlWeb = new HtmlWeb();
            int page = 1;
            bool usersExist = true;
            var users = new List<User>();

            while (usersExist)
            {
                usersExist = false;

                string url = "http://boardgamegeek.com/collection/items/boardgame/" + id + "/page/" + page + "?want=1";
                var html = htmlWeb.Load(url);
                var divs = html.DocumentNode.QuerySelectorAll(".avatarblock[data-username]");

                foreach (var div in divs)
                {
                    users.Add(new User(div.GetAttributeValue("data-username", String.Empty)));
                    usersExist = true;
                }

                page += 1;

            }

            users.RemoveAll(x => x.Name == String.Empty);

            return users;
        }
    }
}