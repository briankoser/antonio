using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace bgg_users_want.Models
{
    public class User
    {
        public string Name { get; private set; }

        public User(string name)
        {
            Name = name;
        }
    }
}