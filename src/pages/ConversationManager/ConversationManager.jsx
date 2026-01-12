
// Consider the Dashboard is your page
import React from 'react'
import TabComponent from '../../components/TabComponent'


const ConversationManager = () => {

  const pageContent = {
    'title': 'Dashboard',
    'subTitle':'Dashboard is All about the contents',
    'tabs':[
      {
        'tabTitle':'All Owners',
        'tabKey':'allOwners',
        'tabContent':<>Your Component Goes Here</>
      },
      {
        'tabTitle':'All Properties',
        'tabKey':'allProperties',
        'tabContent':<>'Hello'</>
      },
      // List of Tabs Goes Here
    ]
  }




  return (
    <div className='h-100'>
      <TabComponent pageContent={pageContent}  />
    </div>
  )
}

export default ConversationManager