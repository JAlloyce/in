          {/* Media options - Responsive grid */}
          <div className="flex justify-evenly w-full px-1 sm:px-0">
            {postOptions.map((option, index) => (
              <button
                key={index}
                className={`
                  flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-1 sm:p-2 rounded-lg sm:rounded-xl
                  bg-gradient-to-br ${option.gradient} bg-opacity-10
                  border border-white/20 backdrop-blur-sm
                  hover:shadow-lg hover:scale-105
                  transition-all duration-300
                  text-gray-700 hover:text-white
                  hover:bg-gradient-to-br hover:${option.gradient}
                  w-full max-w-[20%]  /* Limit width to prevent stretching */
                  min-w-0  /* Prevent text overflow */
                `}
              >
                <option.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-6 lg:h-6 ${option.color}`} />
                <span className="text-[10px] sm:text-xs lg:text-sm font-medium truncate w-full px-0.5">
                  {option.text}
                </span>
              </button>
            ))}
          </div> 