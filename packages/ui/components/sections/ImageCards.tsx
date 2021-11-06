/* This example requires Tailwind CSS v2.0+ */
const defaultItems = [
    {
      id: 1,
      name: 'Leather Long Wallet',
      color: 'Natural',
      price: '$75',
      href: '#',
      imageSrc: 'https://tailwindui.com/img/ecommerce-images/home-page-04-trending-item-02.jpg',
      imageAlt: 'Hand stitched, orange leather long wallet.',
    },
  ]
  
  export function ImageCards({
      title = 'Popular Integrations', 
      subtitle = 'Out-of-the-Box Support', 
      items = defaultItems
    }) {
    return (
      <div className="bg-white">
        <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">{title}</h2>
            <a href="#" className="hidden text-sm font-medium text-indigo-600 hover:text-indigo-500 md:block">
              {subtitle}<span aria-hidden="true"> &rarr;</span>
            </a>
          </div>
  
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-0 lg:gap-x-8">
            {items.map((item) => (
              <div key={item.id} className="group relative">
                <div className="w-full h-56 bg-gray-200 rounded-md overflow-hidden group-hover:opacity-75 lg:h-72 xl:h-80">
                  <img
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    className="w-full h-full object-center object-cover"
                  />
                </div>
                <h3 className="mt-4 text-sm text-gray-700">
                  <a href={item.href}>
                    <span className="absolute inset-0" />
                    {item.name}
                  </a>
                </h3>
                <p className="mt-1 text-sm text-gray-500">{item.color}</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{item.price}</p>
              </div>
            ))}
          </div>
  
          <div className="mt-8 text-sm md:hidden">
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              Shop the collection<span aria-hidden="true"> &rarr;</span>
            </a>
          </div>
        </div>
      </div>
    )
  }
  